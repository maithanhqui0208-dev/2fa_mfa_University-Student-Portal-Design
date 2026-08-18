// A realistic-looking QR code SVG for the TOTP setup screen
// Pattern encodes a mock otpauth URI for UTHPortal
export default function QRCodeSVG({ size = 176 }: { size?: number }) {
  // Each cell = size/29 pixels (29-module Version 2 QR code)
  const M = 29
  const cell = size / M

  // Sparse module map for a plausible-looking QR code
  // 1 = dark, 0 = light. Finder patterns + timing + some data
  const grid: number[][] = Array.from({ length: M }, () => Array(M).fill(0))

  const set = (r: number, c: number) => { if (r >= 0 && r < M && c >= 0 && c < M) grid[r][c] = 1 }
  const clear = (r: number, c: number) => { if (r >= 0 && r < M && c >= 0 && c < M) grid[r][c] = 0 }

  // Finder pattern: top-left
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) set(i, j)
  for (let i = 1; i < 6; i++) for (let j = 1; j < 6; j++) clear(i, j)
  for (let i = 2; i < 5; i++) for (let j = 2; j < 5; j++) set(i, j)

  // Finder pattern: top-right
  for (let i = 0; i < 7; i++) for (let j = M - 7; j < M; j++) set(i, j)
  for (let i = 1; i < 6; i++) for (let j = M - 6; j < M - 1; j++) clear(i, j)
  for (let i = 2; i < 5; i++) for (let j = M - 5; j < M - 2; j++) set(i, j)

  // Finder pattern: bottom-left
  for (let i = M - 7; i < M; i++) for (let j = 0; j < 7; j++) set(i, j)
  for (let i = M - 6; i < M - 1; i++) for (let j = 1; j < 6; j++) clear(i, j)
  for (let i = M - 5; i < M - 2; i++) for (let j = 2; j < 5; j++) set(i, j)

  // Separators (already clear), timing patterns
  for (let i = 8; i < M - 8; i++) { if (i % 2 === 0) { set(6, i); set(i, 6) } }

  // Alignment pattern (Version 2, at row 20, col 20 approx but simplified)
  const ap = 22
  for (let i = ap - 2; i <= ap + 2; i++) for (let j = ap - 2; j <= ap + 2; j++) set(i, j)
  for (let i = ap - 1; i <= ap + 1; i++) for (let j = ap - 1; j <= ap + 1; j++) clear(i, j)
  set(ap, ap)

  // Format info strips (dark module)
  set(8, 13); set(8, 14)

  // Pseudo-random data modules in remaining areas using a seeded pattern
  const seed = [
    // Data region rows 0-5, cols 9-27
    [0,9],[0,11],[0,13],[0,15],[0,17],[0,19],[0,21],[0,23],[0,25],[0,27],
    [1,10],[1,12],[1,14],[1,16],[1,18],[1,22],[1,24],[1,26],
    [2,9],[2,11],[2,15],[2,19],[2,21],[2,25],[2,27],
    [3,10],[3,12],[3,14],[3,16],[3,18],[3,20],[3,24],[3,26],
    [4,9],[4,13],[4,17],[4,21],[4,23],[4,27],
    [5,10],[5,12],[5,16],[5,20],[5,22],[5,24],[5,26],
    // rows 9-20, cols 0-5
    [9,0],[9,2],[9,4],[10,1],[10,3],[10,5],[11,0],[11,2],[11,4],
    [12,1],[12,3],[12,5],[13,0],[13,4],[14,1],[14,3],[14,5],
    [15,0],[15,2],[15,4],[16,1],[16,5],[17,0],[17,2],[17,4],
    [18,1],[18,3],[18,5],[19,0],[19,2],[19,4],[20,1],[20,3],[20,5],
    // rows 7-20, cols 9-27 (scattered)
    [7,9],[7,12],[7,15],[7,18],[7,21],[7,24],[7,27],
    [8,10],[8,16],[8,20],[8,24],
    [9,9],[9,11],[9,14],[9,17],[9,20],[9,23],[9,26],
    [10,10],[10,13],[10,16],[10,19],[10,22],[10,25],
    [11,9],[11,12],[11,15],[11,18],[11,21],[11,24],[11,27],
    [12,10],[12,14],[12,18],[12,22],[12,26],
    [13,9],[13,12],[13,16],[13,20],[13,24],[13,27],
    [14,10],[14,13],[14,17],[14,21],[14,25],
    [15,9],[15,11],[15,14],[15,18],[15,22],[15,26],
    [16,10],[16,12],[16,15],[16,19],[16,23],[16,27],
    [17,9],[17,13],[17,16],[17,20],[17,24],
    [18,10],[18,14],[18,18],[18,22],[18,26],
    [19,9],[19,11],[19,15],[19,19],[19,23],[19,27],
    [20,10],[20,13],[20,17],[20,21],[20,25],
    // rows 23-28, cols 8-27
    [21,8],[21,10],[21,13],[21,16],[21,19],[21,22],[21,25],[21,28],
    [22,9],[22,11],[22,14],[22,17],[22,20],[22,23],[22,26],
    [23,8],[23,10],[23,12],[23,15],[23,18],[23,21],[23,24],[23,27],
    [24,9],[24,13],[24,16],[24,19],[24,22],[24,25],[24,28],
    [25,8],[25,11],[25,14],[25,17],[25,20],[25,23],[25,26],
    [26,9],[26,12],[26,15],[26,18],[26,21],[26,24],[26,27],
    [27,8],[27,10],[27,13],[27,16],[27,19],[27,22],[27,25],[27,28],
    [28,9],[28,11],[28,14],[28,17],[28,20],[28,23],[28,26],
  ]
  seed.forEach(([r, c]) => set(r, c))

  return (
    <div className="inline-block bg-white p-3 rounded-xl border-2 border-gray-200 shadow-sm">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={size} height={size} fill="white" />
        {grid.flatMap((row, r) =>
          row.map((val, c) =>
            val ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell}
                y={r * cell}
                width={cell}
                height={cell}
                fill="#1E3A8A"
                rx={cell * 0.15}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  )
}
