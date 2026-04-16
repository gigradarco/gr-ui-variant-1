const MAX_DIM = 1024
const MAX_BYTES = 2 * 1024 * 1024

/**
 * Downscale and encode as JPEG so uploads stay under typical Storage limits.
 */
export async function resizeImageForAvatar(source: File): Promise<File> {
  const bitmap = await createImageBitmap(source)
  try {
    let { width, height } = bitmap
    const scale = Math.min(1, MAX_DIM / Math.max(width, height))
    width = Math.round(width * scale)
    height = Math.round(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not prepare image')
    }
    ctx.drawImage(bitmap, 0, 0, width, height)

    let quality = 0.88
    let blob: Blob | null = null
    for (let i = 0; i < 6; i++) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
      })
      if (!blob) break
      if (blob.size <= MAX_BYTES) break
      quality -= 0.12
    }

    if (!blob || blob.size === 0) {
      throw new Error('Could not encode image')
    }
    if (blob.size > MAX_BYTES) {
      throw new Error('Image is still too large after resizing — try another photo')
    }

    return new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
  } finally {
    bitmap.close()
  }
}
