// Shrinks a photo in the browser so it can be stored with its gallery entry.
// Longest side <= 1400px, JPEG; quality is lowered until the result is small enough.
export async function compressImage(file: File, maxSide = 1400, maxChars = 600_000): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('not-image');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('unreadable'));
      i.src = url;
    });
    let scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    for (let attempt = 0; attempt < 6; attempt++) {
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no-canvas');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      for (const q of [0.82, 0.72, 0.62, 0.52]) {
        const data = canvas.toDataURL('image/jpeg', q);
        if (data.length <= maxChars) return data;
      }
      scale *= 0.8;
    }
    throw new Error('too-large');
  } finally {
    URL.revokeObjectURL(url);
  }
}
