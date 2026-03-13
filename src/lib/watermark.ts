// Watermark utility for adding "TOASTCAP" watermark to uploaded files
import sharp from 'sharp';

function isImage(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

function isPDF(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}

async function addWatermarkToImage(buffer: Buffer, filename: string): Promise<Buffer> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    const fontSize = Math.max(Math.min(width, height) / 15, 24);
    const watermarkText = 'TOASTCAP';
    const angle = -30;

    const svgWatermark = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="watermarkPattern" width="${fontSize * 12}" height="${fontSize * 4}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">
            <text x="0" y="${fontSize}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="rgba(0, 0, 0, 0.25)" font-weight="bold">
              ${watermarkText}
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#watermarkPattern)" />
      </svg>
    `;

    const watermarkedBuffer = await image
      .composite([{ input: Buffer.from(svgWatermark), gravity: 'center' }])
      .toBuffer();

    console.log(`✅ Watermark added to image: ${filename}`);
    return watermarkedBuffer;
  } catch (error) {
    console.error(`⚠️ Failed to add watermark to image ${filename}:`, error);
    return buffer;
  }
}

async function addWatermarkToPDF(buffer: Buffer, filename: string): Promise<Buffer> {
  try {
    const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const watermarkText = 'TOASTCAP';

    for (const page of pages) {
      const { width, height } = page.getSize();
      const fontSize = Math.max(Math.min(width, height) / 20, 20);
      const textWidth = helveticaBold.widthOfTextAtSize(watermarkText, fontSize);
      const spacing = textWidth * 1.5;

      for (let y = -height; y < height * 2; y += spacing * 0.6) {
        for (let x = -width; x < width * 2; x += spacing) {
          page.drawText(watermarkText, {
            x: x,
            y: y,
            size: fontSize,
            font: helveticaBold,
            color: rgb(0, 0, 0),
            opacity: 0.15,
            rotate: degrees(-30),
          });
        }
      }
    }

    const watermarkedPdfBytes = await pdfDoc.save();
    console.log(`✅ Watermark added to PDF: ${filename}`);
    return Buffer.from(watermarkedPdfBytes);
  } catch (error) {
    console.error(`⚠️ Failed to add watermark to PDF ${filename}:`, error);
    return buffer;
  }
}

export async function processFileWithWatermark(
  file: File
): Promise<{ buffer: Buffer; filename: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = file.name;

  console.log(`🔍 Processing file for watermark: ${filename}`);

  if (isImage(filename)) {
    console.log(`📷 Detected image file: ${filename}`);
    const watermarkedBuffer = await addWatermarkToImage(buffer, filename);
    return { buffer: watermarkedBuffer, filename: `WM_${filename}` };
  } else if (isPDF(filename)) {
    console.log(`📄 Detected PDF file: ${filename}`);
    const watermarkedBuffer = await addWatermarkToPDF(buffer, filename);
    return { buffer: watermarkedBuffer, filename: `WM_${filename}` };
  } else {
    console.log(`📁 Unknown file type, returning original: ${filename}`);
    return { buffer, filename };
  }
}
