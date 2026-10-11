import { ref, computed, watch } from 'vue'

const PRIMARY_STORAGE_KEY = 'dailyy_logs_v1'
const LEGACY_STORAGE_KEY = 'aktivitasku_logs_v1'


const parseSafeTimestamp = (val) => {
  if (typeof val === 'number' && Number.isFinite(val)) return val
  if (!val) return Date.now()
  const parsed = new Date(val).getTime()
  return Number.isFinite(parsed) ? parsed : Date.now()
}

export function useActivityLogs() {
  const logs = ref([])

  // Load from LocalStorage (with backward compatibility)
  const loadLogs = () => {
    try {
      const stored = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
      if (stored) {
        logs.value = JSON.parse(stored)
      } else {
        logs.value = []
      }
    } catch (e) {
      console.error('Failed to parse logs from LocalStorage', e)
      logs.value = []
    }
  }

  loadLogs()

  // Watch & Persist to LocalStorage
  watch(
    logs,
    (newLogs) => {
      try {
        localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(newLogs))
      } catch (e) {
        console.error('Failed to save logs to LocalStorage', e)
      }
    },
    { deep: true }
  )

  // Add Log
  const addLog = (title, customTimestamp = null, note = '') => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return false

    const newLog = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      title: trimmedTitle,
      timestamp: parseSafeTimestamp(customTimestamp),
      note: note.trim()
    }

    logs.value.unshift(newLog)
    // Sort descending by timestamp
    logs.value.sort((a, b) => b.timestamp - a.timestamp)
    return true
  }

  // Update Log
  const updateLog = (id, updates) => {
    const index = logs.value.findIndex((l) => l.id === id)
    if (index === -1) return false

    logs.value[index] = {
      ...logs.value[index],
      ...updates,
      title: updates.title ? updates.title.trim() : logs.value[index].title,
      timestamp: updates.timestamp ? parseSafeTimestamp(updates.timestamp) : logs.value[index].timestamp
    }

    logs.value.sort((a, b) => b.timestamp - a.timestamp)
    return true
  }

  // Delete Log
  const deleteLog = (id) => {
    logs.value = logs.value.filter((l) => l.id !== id)
  }

  // Clear all logs
  const clearLogs = () => {
    logs.value = []
    localStorage.removeItem(PRIMARY_STORAGE_KEY)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  }

  // Frequent / Shortcut suggestions (only from user's logged activities, empty if no logs)
  const frequentSuggestions = computed(() => {
    if (!logs.value || logs.value.length === 0) return []

    const countMap = {}
    logs.value.forEach((log) => {
      const t = log.title?.trim()
      if (t) {
        countMap[t] = (countMap[t] || 0) + 1
      }
    })

    const sortedByCount = Object.keys(countMap).sort((a, b) => countMap[b] - countMap[a])
    return sortedByCount.slice(0, 6)
  })

  // Format Helper for Date Labels
  const formatDayLabel = (dateObj) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const targetDate = new Date(dateObj)
    targetDate.setHours(0, 0, 0, 0)

    if (targetDate.getTime() === today.getTime()) {
      return 'Hari Ini'
    } else if (targetDate.getTime() === yesterday.getTime()) {
      return 'Kemarin'
    }

    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    }).format(dateObj)
  }

  // Grouped Logs by Day
  const groupedLogs = computed(() => {
    const groups = {}

    logs.value.forEach((log) => {
      const d = new Date(log.timestamp)
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateKey,
          label: formatDayLabel(d),
          fullDate: new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(d),
          items: []
        }
      }

      groups[dateKey].items.push(log)
    })

    // Return array ordered by dateKey descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => groups[key])
  })

  // Weekly Stats (last 7 days)
  const weeklyStats = computed(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentLogs = logs.value.filter((l) => l.timestamp >= sevenDaysAgo)
    const map = {}

    recentLogs.forEach((l) => {
      map[l.title] = (map[l.title] || 0) + 1
    })

    return {
      totalCount: recentLogs.length,
      breakdown: Object.entries(map)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
    }
  })

  // Monthly Stats (last 30 days)
  const monthlyStats = computed(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentLogs = logs.value.filter((l) => l.timestamp >= thirtyDaysAgo)
    const map = {}

    recentLogs.forEach((l) => {
      map[l.title] = (map[l.title] || 0) + 1
    })

    return {
      totalCount: recentLogs.length,
      breakdown: Object.entries(map)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
    }
  })

  // Export Data to JSON
  const exportBackup = () => {
    const dataStr = JSON.stringify(logs.value, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const now = new Date()
    const fileName = `dailyy-backup-${now.toISOString().split('T')[0]}.json`

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Import Data from JSON
  const importBackup = (jsonString, { merge = false } = {}) => {
    try {
      const parsed = JSON.parse(jsonString)
      if (!Array.isArray(parsed)) {
        throw new Error('Format data tidak valid (harus array).')
      }

      // Basic validation
      const validLogs = parsed.filter(
        (item) => item && typeof item.title === 'string' && (item.timestamp || item.id)
      ).map((item) => ({
        id: item.id || (Date.now().toString(36) + Math.random().toString(36).substring(2, 7)),
        title: item.title.trim(),
        timestamp: parseSafeTimestamp(item.timestamp),
        note: item.note || ''
      }))

      if (merge) {
        const existingIds = new Set(logs.value.map((l) => l.id))
        const newItems = validLogs.filter((l) => !existingIds.has(l.id))
        logs.value = [...logs.value, ...newItems]
      } else {
        logs.value = validLogs
      }

      logs.value.sort((a, b) => b.timestamp - a.timestamp)
      return { success: true, count: validLogs.length }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  return {
    logs,
    groupedLogs,
    frequentSuggestions,
    weeklyStats,
    monthlyStats,
    addLog,
    updateLog,
    deleteLog,
    clearLogs,
    exportBackup,
    importBackup
  }
}

