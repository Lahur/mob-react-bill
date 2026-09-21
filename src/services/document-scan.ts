import { File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { PDFDocument } from 'pdf-lib';
import DocumentScanner from 'react-native-document-scanner-plugin';

const toFileUri = (path: string) => (path.startsWith('file://') || path.startsWith('data:') ? path : `file://${path}`);

// A4 width at 300 DPI, so the PDF reads like a real document scan instead of a full-resolution camera photo.
const SCAN_TARGET_WIDTH = 2480;

export async function scanDocument(): Promise<string | undefined> {
  const { scannedImages } = await DocumentScanner.scanDocument({ croppedImageQuality: 70, maxNumDocuments: 1 });
  return scannedImages?.[0];
}

export async function imageToPdf(imageUri: string, fileName: string): Promise<{ uri: string }> {
  const resizedImage = await ImageManipulator.manipulate(toFileUri(imageUri))
    .resize({ width: SCAN_TARGET_WIDTH })
    .renderAsync();
  const { uri: resizedImageUri } = await resizedImage.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  const jpegBytes = await new File(toFileUri(resizedImageUri)).bytes();

  const pdfDoc = await PDFDocument.create();
  const jpgImage = await pdfDoc.embedJpg(jpegBytes);
  const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
  page.drawImage(jpgImage, { x: 0, y: 0, width: jpgImage.width, height: jpgImage.height });
  const pdfBytes = await pdfDoc.save();

  const pdfFile = new File(Paths.cache, fileName);
  pdfFile.create();
  pdfFile.write(pdfBytes);
  return { uri: pdfFile.uri };
}
