import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

// PNG CRC32 table
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  }
  crcTable[n] = c
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = data ? data.length : 0
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(len, 0)
  
  const toCrc = data ? Buffer.concat([typeBuf, data]) : typeBuf
  const crcVal = crc32(toCrc)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crcVal, 0)

  return Buffer.concat([lenBuf, toCrc, crcBuf])
}

function generatePng(size) {
  const width = size
  const height = size
  const rowBytes = 1 + width * 4 // 1 filter byte + RGBA
  const rawData = Buffer.alloc(rowBytes * height)

  const center = size / 2
  const cornerRadius = size * 0.22

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes
    rawData[rowOffset] = 0 // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4

      // Rounded rectangle mask
      const dx = Math.max(0, Math.abs(x - center) - (center - cornerRadius))
      const dy = Math.max(0, Math.abs(y - center) - (center - cornerRadius))
      const distFromCorner = Math.sqrt(dx * dx + dy * dy)

      if (distFromCorner > cornerRadius) {
        // Transparent outside rounded rect
        rawData[pxOffset] = 0
        rawData[pxOffset + 1] = 0
        rawData[pxOffset + 2] = 0
        rawData[pxOffset + 3] = 0
        continue
      }

      // Background gradient: Indigo (#4f46e5) to Violet (#7c3aed)
      const grad = (x + y) / (width + height)
      let r = Math.round(79 + (124 - 79) * grad)
      let g = Math.round(70 + (58 - 70) * grad)
      let b = Math.round(229 + (237 - 229) * grad)

      // Draw Checkmark icon in white
      // Normalized coords (0 to 1)
      const nx = x / size
      const ny = y / size

      // Checkmark geometry: segment 1: (0.30, 0.52) to (0.45, 0.67)
      // segment 2: (0.45, 0.67) to (0.72, 0.36)
      const thick = 0.055

      // Distance to line segment helper
      function distToSeg(px, py, x1, y1, x2, y2) {
        const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
        if (l2 === 0) return Math.hypot(px - x1, py - y1)
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2
        t = Math.max(0, Math.min(1, t))
        return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)))
      }

      const d1 = distToSeg(nx, ny, 0.31, 0.52, 0.45, 0.66)
      const d2 = distToSeg(nx, ny, 0.45, 0.66, 0.70, 0.36)
      const minD = Math.min(d1, d2)

      if (minD < thick) {
        // Antialiased checkmark edge
        const checkAlpha = Math.min(1, Math.max(0, (thick - minD) / 0.015))
        r = Math.round(r * (1 - checkAlpha) + 255 * checkAlpha)
        g = Math.round(g * (1 - checkAlpha) + 255 * checkAlpha)
        b = Math.round(b * (1 - checkAlpha) + 255 * checkAlpha)
      }

      rawData[pxOffset] = r
      rawData[pxOffset + 1] = g
      rawData[pxOffset + 2] = b
      rawData[pxOffset + 3] = 255
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr)

  // IDAT
  const compressed = zlib.deflateSync(rawData, { level: 9 })
  const idatChunk = makeChunk('IDAT', compressed)

  // IEND
  const iendChunk = makeChunk('IEND', null)

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

const publicDir = path.resolve('public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192))
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512))
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180))

// SVG Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#grad)"/>
  <path d="M150 265 L230 345 L360 185" fill="none" stroke="#ffffff" stroke-width="52" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon)
console.log('Icons generated successfully!')

