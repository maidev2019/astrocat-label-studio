import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { Batch } from '../../types/models';

/**
 * Capture the actual HTML label without SVG foreignObject.
 * foreignObject SVGs can taint canvas even when all assets are local.
 * html2canvas paints DOM content directly on an origin-clean canvas.
 */
async function captureLabel(): Promise<string> {
  const source = document.getElementById('label-print-surface') as HTMLElement | null;
  if (!source) throw new Error('Keine Etikettenvorschau gefunden.');
  await document.fonts.ready;
  const stage = document.createElement('div');
  stage.style.cssText = 'position:fixed;left:-12000px;top:0;width:70mm;height:100mm;pointer-events:none;z-index:-1';
  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.style.zoom = '1';
  clone.style.overflow = 'visible';
  clone.style.transform = 'none';
  stage.appendChild(clone);
  document.body.appendChild(stage);
  try {
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(images.map(img => img.decode().catch(() => {
      throw new Error('Logo konnte nicht geladen werden. Bitte als PNG/JPG erneut hochladen.');
    })));
    const excess = clone.scrollHeight - clone.clientHeight;
    if (excess > 2) throw new Error(`Etikett ist um etwa ${(excess * 25.4 / 96).toFixed(1)} mm zu hoch. Pflichtangaben dürfen nicht abgeschnitten werden.`);
    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff', scale: 4, useCORS: true, allowTaint: false,
      logging: false, imageTimeout: 10000,
      width: clone.clientWidth, height: clone.clientHeight,
      scrollX: 0, scrollY: 0,
    });
    return canvas.toDataURL('image/png');
  } finally {
    stage.remove();
  }
}

function downloadBlobDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportPreviewPNG(batch: Batch): Promise<void> {
  const png = await captureLabel();
  downloadBlobDataUrl(png, `astrocat-${batch.number}-70x100.png`);
}

export async function exportPreviewPDF(batch: Batch): Promise<void> {
  const png = await captureLabel();
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [70, 100], compress: true });
  const copies = Math.min(Math.max(batch.quantity, 1), 500);
  for (let i = 0; i < copies; i++) {
    if (i > 0) pdf.addPage([70, 100], 'portrait');
    pdf.addImage(png, 'PNG', 0, 0, 70, 100, undefined, 'FAST');
  }
  pdf.save(`astrocat-${batch.number}-70x100.pdf`);
}
