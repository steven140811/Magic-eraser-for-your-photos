export enum AppState {
  IDLE = 'IDLE',
  PREVIEW = 'PREVIEW',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface ProcessingResult {
  originalUrl: string;
  processedUrl: string;
}
