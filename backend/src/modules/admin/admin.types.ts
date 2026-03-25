export interface SaveDashboardPreferencesDto {
  widgets: Array<{
    key: string;
    position: number;
    is_visible: boolean;
    settings?: any;
  }>;
}
