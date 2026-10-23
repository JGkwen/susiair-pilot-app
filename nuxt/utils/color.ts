const NAVY_LUMINANCE = relativeLuminance('#0e2138')

function linearChannel(hex: string, start: number): number {
  const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  return 0.2126 * linearChannel(hex, 1) + 0.7152 * linearChannel(hex, 3) + 0.0722 * linearChannel(hex, 5)
}

export function needsLightText(background: string): boolean {
  const luminance = relativeLuminance(background)
  const contrastWithWhite = 1.05 / (luminance + 0.05)
  const contrastWithNavy = (luminance + 0.05) / (NAVY_LUMINANCE + 0.05)
  return contrastWithWhite > contrastWithNavy
}
