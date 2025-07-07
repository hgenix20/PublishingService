export interface Platform {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface MediaFile {
  file: File;
  name: string;
  size: number;
  type: string;
  preview: string;
}

export interface PublishStatus {
  status: 'publishing' | 'success' | 'error';
  message: string;
}