import { apiRequest } from '@/lib/api-client';
import type { ApplicationStatus } from '../types/application-status';
import type { JobApplication } from '../types/job-application';
import type { JobApplicationPayload } from '../types/job-application-payload';

const JOB_APPLICATIONS_PATH = '/job-applications';

export const jobApplicationsApi = {
  list(status?: ApplicationStatus): Promise<JobApplication[]> {
    const query = status ? `?${new URLSearchParams({ status })}` : '';
    return apiRequest(`${JOB_APPLICATIONS_PATH}${query}`);
  },

  get(id: string): Promise<JobApplication> {
    return apiRequest(`${JOB_APPLICATIONS_PATH}/${id}`);
  },

  create(payload: JobApplicationPayload): Promise<JobApplication> {
    return apiRequest(JOB_APPLICATIONS_PATH, { method: 'POST', body: JSON.stringify(payload) });
  },

  update(id: string, payload: JobApplicationPayload): Promise<JobApplication> {
    return apiRequest(`${JOB_APPLICATIONS_PATH}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest(`${JOB_APPLICATIONS_PATH}/${id}`, { method: 'DELETE' });
  },
};
