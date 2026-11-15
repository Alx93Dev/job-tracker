import { expect, type Page } from '@playwright/test';

const JOB_APPLICATIONS_API_PATH = '/api/job-applications';

interface JobApplicationSummary {
  id: string;
  positionTitle: string;
  companyName: string;
}

/**
 * Puts one of the signed-in user's applications in a known column through the API, so a
 * test that moves cards starts from the same board on retries and repeated runs.
 */
export async function setApplicationStatus(
  page: Page,
  application: { positionTitle: string; companyName: string },
  status: string,
): Promise<void> {
  const listResponse = await page.request.get(JOB_APPLICATIONS_API_PATH);
  expect(listResponse.ok()).toBe(true);

  const jobApplications = (await listResponse.json()) as JobApplicationSummary[];
  const target = jobApplications.find(
    (jobApplication) =>
      jobApplication.positionTitle === application.positionTitle &&
      jobApplication.companyName === application.companyName,
  );
  if (!target) {
    throw new Error(
      `No application "${application.positionTitle}" at ${application.companyName} for the signed-in user.`,
    );
  }

  const updateResponse = await page.request.patch(`${JOB_APPLICATIONS_API_PATH}/${target.id}`, {
    data: { status },
  });
  expect(updateResponse.ok()).toBe(true);
}
