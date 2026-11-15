import { apiRequest } from '@/lib/api-client';
import type { CvProfile } from '../types/cv-profile';

export const profileApi = {
  getCv(): Promise<CvProfile> {
    return apiRequest('/profile/cv');
  },

  updateCv(cvText: string): Promise<CvProfile> {
    return apiRequest('/profile/cv', { method: 'PUT', body: JSON.stringify({ cvText }) });
  },
};
