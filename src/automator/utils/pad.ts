export function pad(n: string, width: number, z?: string) {
  z = z || '0'
  n += ''
  return n.length >= width ? n : new Array((width - n.length) + 1).join(z) + n
}
