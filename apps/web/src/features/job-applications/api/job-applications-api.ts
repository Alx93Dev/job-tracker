import { apiRequest } from '@/lib/api-client';
import type { JobApplication } from '../types/job-application';
import type { JobApplicationFilters } from '../types/job-application-filters';
import type { JobApplicationPayload } from '../types/job-application-payload';

const JOB_APPLICATIONS_PATH = '/job-applications';

function buildListQuery({ status, search }: JobApplicationFilters): string {
  const queryParams = new URLSearchParams();
  if (status) queryParams.set('status', status);
  if (search) queryParams.set('search', search);
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

export const jobApplicationsApi = {
  list(filters: JobApplicationFilters = {}): Promise<JobApplication[]> {
    return apiRequest(`${JOB_APPLICATIONS_PATH}${buildListQuery(filters)}`);
  },

  get(id: string): Promise<JobApplication> {
    return apiRequest(`${JOB_APPLICATIONS_PATH}/${id}`);
  },

  create(payload: JobApplicationPayload): Promise<JobApplication> {
    return apiRequest(JOB_APPLICATIONS_PATH, { method: 'POST', body: JSON.stringify(payload) });
  },

  update(id: string, payload: Partial<JobApplicationPayload>): Promise<JobApplication> {
    return apiRequest(`${JOB_APPLICATIONS_PATH}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest(`${JOB_APPLICATIONS_PATH}/${id}`, { method: 'DELETE' });
  },
};
