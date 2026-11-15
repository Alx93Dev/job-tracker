import { apiRequest } from '@/lib/api-client';
import type { AnalyticsSummary } from '../types/analytics-summary';

export const analyticsApi = {
  getSummary(): Promise<AnalyticsSummary> {
    return apiRequest('/analytics/summary');
  },
};
