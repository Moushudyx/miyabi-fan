export function splitFileUrl(url: string): { baseUrl: string; fileName: string } {
  const lastSlashIndex = url.lastIndexOf('/')
  if (lastSlashIndex === -1) {
    return { baseUrl: '', fileName: url }
  }
  return {
    baseUrl: url.substring(0, lastSlashIndex + 1),
    fileName: url.substring(lastSlashIndex + 1),
  }
}
