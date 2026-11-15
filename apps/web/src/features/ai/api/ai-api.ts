import { apiRequest } from '@/lib/api-client';
import type { ExtractedJobPosting } from '../types/extracted-job-posting';

export const aiApi = {
  extractJobPosting(postingText: string): Promise<ExtractedJobPosting> {
    return apiRequest('/ai/job-postings/extract', {
      method: 'POST',
      body: JSON.stringify({ postingText }),
    });
  },
};
