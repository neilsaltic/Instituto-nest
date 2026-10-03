export class WebhookMockPayDto {
  event: string;
  id: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED';
  failure_reason?: string | null;
  metadata?: {
    pagoId?: string;
    matriculaId?: string;
  };
}
