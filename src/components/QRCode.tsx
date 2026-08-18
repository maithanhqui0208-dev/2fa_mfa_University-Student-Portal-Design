import QRCode from 'qrcode'

// Renders a real, scannable QR code for the given text (e.g. an otpauth:// URI)
// as an inline SVG, using the `qrcode` library's synchronous matrix generator.
export default function QRCodeSVG({ value, size = 176 }: { value: string; size?: number }) {
  const qr = QRCode.create(value, { errorCorrectionLevel: 'M' })
  const modules = qr.modules
  const count = modules.size
  const cell = size / count

  const rects: React.ReactNode[] = []
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (modules.get(row, col)) {
        rects.push(
          <rect
            key={`${row}-${col}`}
            x={col * cell}
            y={row * cell}
            width={cell}
            height={cell}
            fill="#1E3A8A"
          />
        )
      }
    }
  }

  return (
    <div className="inline-block bg-white p-3 rounded-xl border-2 border-gray-200 shadow-sm">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={size} height={size} fill="white" />
        {rects}
      </svg>
    </div>
  )
}
