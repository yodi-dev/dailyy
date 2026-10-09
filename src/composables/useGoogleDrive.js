import { ref, computed } from 'vue'

const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '10475823948-6l2qk1g1313g4c8afujo6md17t51th20.apps.googleusercontent.com'

const SCOPES =
  'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'

const BACKUP_FILENAME = 'dailyy-backup.json'

export function useGoogleDrive() {
  const accessToken = ref(sessionStorage.getItem('dailyy_gdrive_token') || null)
  const userProfile = ref(
    JSON.parse(localStorage.getItem('dailyy_gdrive_user') || 'null')
  )
  const lastBackupTime = ref(
    localStorage.getItem('dailyy_gdrive_last_backup') || null
  )
  const isLoading = ref(false)
  const statusMessage = ref('')

  const isConnected = computed(() => !!userProfile.value)

  // Request Access Token from Google Identity Services (GIS)
  const requestToken = () => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        reject(
          new Error('Google Identity Services belum termuat. Periksa koneksi internet.')
        )
        return
      }

      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (resp) => {
            if (resp.error) {
              reject(new Error(resp.error))
              return
            }
            accessToken.value = resp.access_token
            sessionStorage.setItem('dailyy_gdrive_token', resp.access_token)

            // Fetch user profile info
            try {
              const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${resp.access_token}` }
              })
              if (infoRes.ok) {
                const profile = await infoRes.json()
                userProfile.value = {
                  name: profile.name,
                  email: profile.email,
                  picture: profile.picture
                }
                localStorage.setItem('dailyy_gdrive_user', JSON.stringify(userProfile.value))
              }
            } catch (err) {
              console.warn('Could not fetch user profile details:', err)
            }

            resolve(resp.access_token)
          }
        })

        tokenClient.requestAccessToken({ prompt: '' })
      } catch (err) {
        reject(err)
      }
    })
  }

  // Ensure valid token is available
  const ensureToken = async () => {
    if (accessToken.value) return accessToken.value
    return await requestToken()
  }

  // Connect Google Account
  const connect = async () => {
    isLoading.value = true
    statusMessage.value = 'Menghubungkan ke akun Google...'
    try {
      await requestToken()
      statusMessage.value = 'Akun Google berhasil terhubung!'
      return { success: true }
    } catch (err) {
      statusMessage.value = `Gagal menghubungkan: ${err.message}`
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Disconnect Google Account
  const disconnect = () => {
    if (accessToken.value && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(accessToken.value, () => {})
    }
    accessToken.value = null
    userProfile.value = null
    sessionStorage.removeItem('dailyy_gdrive_token')
    localStorage.removeItem('dailyy_gdrive_user')
    statusMessage.value = 'Akun Google telah diputuskan.'
  }

  // Find existing backup file on Drive
  const findBackupFileId = async (token) => {
    const q = encodeURIComponent(`name='${BACKUP_FILENAME}' and trashed=false`)
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    if (!res.ok) {
      throw new Error('Gagal memeriksa file di Google Drive.')
    }
    const data = await res.json()
    if (data.files && data.files.length > 0) {
      return data.files[0].id
    }
    return null
  }

  // Backup Data to Google Drive
  const backup = async (logs) => {
    isLoading.value = true
    statusMessage.value = 'Mengunggah backup ke Google Drive...'
    try {
      const token = await ensureToken()
      const existingFileId = await findBackupFileId(token)
      const content = JSON.stringify(logs, null, 2)

      if (existingFileId) {
        // Update existing file
        const updateRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: content
          }
        )
        if (!updateRes.ok) throw new Error('Gagal memperbarui file backup di Google Drive.')
      } else {
        // Create new file with multipart upload
        const metadata = {
          name: BACKUP_FILENAME,
          mimeType: 'application/json',
          description: 'Dailyy Activity Log Backup'
        }

        const boundary = '-------dailyy_boundary_' + Date.now()
        const delimiter = `\r\n--${boundary}\r\n`
        const closeDelimiter = `\r\n--${boundary}--`

        const multipartBody =
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          content +
          closeDelimiter

        const createRes = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body: multipartBody
          }
        )
        if (!createRes.ok) throw new Error('Gagal membuat file backup di Google Drive.')
      }

      const now = new Date().toISOString()
      lastBackupTime.value = now
      localStorage.setItem('dailyy_gdrive_last_backup', now)
      statusMessage.value = 'Backup ke Google Drive berhasil!'
      return { success: true, timestamp: now }
    } catch (err) {
      statusMessage.value = `Gagal backup: ${err.message}`
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Restore Data from Google Drive
  const restore = async () => {
    isLoading.value = true
    statusMessage.value = 'Mengunduh backup dari Google Drive...'
    try {
      const token = await ensureToken()
      const fileId = await findBackupFileId(token)

      if (!fileId) {
        throw new Error('Tidak ditemukan file backup Dailyy di Google Drive kamu.')
      }

      const downloadRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!downloadRes.ok) {
        throw new Error('Gagal mengunduh file backup.')
      }

      const rawJson = await downloadRes.text()
      statusMessage.value = 'Data berhasil diunduh dari Google Drive!'
      return { success: true, content: rawJson }
    } catch (err) {
      statusMessage.value = `Gagal restore: ${err.message}`
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Format Helper for Last Backup Display
  const formattedLastBackup = computed(() => {
    if (!lastBackupTime.value) return 'Belum pernah di-backup'
    const d = new Date(lastBackupTime.value)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  })

  return {
    isConnected,
    userProfile,
    lastBackupTime,
    formattedLastBackup,
    isLoading,
    statusMessage,
    connect,
    disconnect,
    backup,
    restore
  }
}
