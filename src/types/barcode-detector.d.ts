/**
 * Minimal typing for the Shape Detection API's BarcodeDetector, which is
 * available in some Chromium-based browsers but not yet in TypeScript's DOM
 * library. Always feature-detect before use.
 */
interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorOptions {
  formats?: string[];
}

interface BarcodeDetector {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: BarcodeDetectorOptions): BarcodeDetector;
  getSupportedFormats(): Promise<string[]>;
}

interface Window {
  BarcodeDetector?: BarcodeDetectorConstructor;
}
