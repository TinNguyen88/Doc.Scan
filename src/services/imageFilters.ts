import { PageFilter, FilterSettings } from '../types';

export async function processImageWithFilter(
  imageDataUrl: string,
  filter: PageFilter,
  settings: FilterSettings
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(imageDataUrl);
        }

        const rotation = (settings.rotation || 0) % 360;
        const isRotated90or270 = rotation === 90 || rotation === 270;

        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        canvas.width = isRotated90or270 ? origH : origW;
        canvas.height = isRotated90or270 ? origW : origH;

        // Apply canvas transformation for rotation
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
        ctx.restore();

        // Get pixel data for pixel manipulation
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        const { brightness = 0, contrast = 0, saturation = 0 } = settings;

        // Contrast factor calculation: [-100..100] -> [0..2]
        const contrastFactor = (255 + contrast * 2.55) / (255 - contrast * 2.55);

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // 1. Apply Brightness
          if (brightness !== 0) {
            r = Math.min(255, Math.max(0, r + brightness * 2.55));
            g = Math.min(255, Math.max(0, g + brightness * 2.55));
            b = Math.min(255, Math.max(0, b + brightness * 2.55));
          }

          // 2. Apply Contrast
          if (contrast !== 0) {
            r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
          }

          // Filter presets
          if (filter === 'grayscale') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = gray;
            g = gray;
            b = gray;
          } else if (filter === 'bw') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            // Adaptive threshold approximation
            const threshold = 140 + (brightness / 2);
            const val = gray > threshold ? 255 : 0;
            r = val;
            g = val;
            b = val;
          } else if (filter === 'magic') {
            // Magic Enhance: Boost white backgrounds and darken dark text
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            if (gray > 175) {
              // Whitening paper background
              r = Math.min(255, r * 1.25 + 20);
              g = Math.min(255, g * 1.25 + 20);
              b = Math.min(255, b * 1.25 + 20);
            } else {
              // Darkening text ink
              r = Math.max(0, r * 0.75 - 10);
              g = Math.max(0, g * 0.75 - 10);
              b = Math.max(0, b * 0.75 - 10);
            }
          } else if (filter === 'contrast') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const factor = 1.4;
            r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
          }

          // Saturation
          if (saturation !== 0 && filter === 'original') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const satFact = 1 + saturation / 100;
            r = Math.min(255, Math.max(0, gray + (r - gray) * satFact));
            g = Math.min(255, Math.max(0, gray + (g - gray) * satFact));
            b = Math.min(255, Math.max(0, gray + (b - gray) * satFact));
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }

        ctx.putImageData(imgData, 0, 0);

        // Convert canvas to Data URL JPEG
        const resultUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(resultUrl);
      } catch (err) {
        console.error('Error processing filter canvas:', err);
        resolve(imageDataUrl);
      }
    };

    img.onerror = (err) => {
      console.error('Failed to load image for filter processing:', err);
      reject(err);
    };

    img.src = imageDataUrl;
  });
}
