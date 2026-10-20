export type DocumentStatus = 'safe' | 'soon' | 'expired';

export interface DocumentDto {
  id: string;
  name: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
}

export interface DocumentsResponseDto {
  items: DocumentDto[];
}
