
export enum FormatId {
  INSTA_POST = 'INSTA_POST',
  INSTA_STORY = 'INSTA_STORY',
  PORTAL_CAMPI = 'PORTAL_CAMPI',
  PORTAL_PRINCIPAL = 'PORTAL_PRINCIPAL',
}

export interface FormatConfig {
  id: FormatId;
  name: string;
  width: number;
  height: number;
  hasText: boolean;
  hasLogo: boolean;
}

export interface ImageTransform {
  zoom: number;
  position: { x: number; y: number };
}

export type ExportType = 'png' | 'jpeg';
