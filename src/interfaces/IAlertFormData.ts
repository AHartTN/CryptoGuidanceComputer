// Interface for alert form data in RealTimeDashboard
export interface IAlertFormData {
  symbol: string;
  condition: 'above' | 'below' | 'change_percent';
  threshold: number;
}
