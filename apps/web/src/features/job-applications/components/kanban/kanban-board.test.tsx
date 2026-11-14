import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildJobApplication } from '../../test-utils/build-job-application';
import { KanbanBoard } from './kanban-board';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('KanbanBoard', () => {
  it('renders one labelled column per status with its applications and count', () => {
    render(
      <KanbanBoard
        jobApplications={[
          buildJobApplication({ id: 'a', positionTitle: 'React Dev', status: 'APPLIED' }),
          buildJobApplication({ id: 'b', positionTitle: 'Angular Dev', status: 'APPLIED' }),
          buildJobApplication({ id: 'c', positionTitle: 'Vue Dev', status: 'OFFER' }),
        ]}
        onStatusChange={vi.fn()}
      />,
    );

    const appliedColumn = screen.getByRole('region', { name: /applied/i });
    expect(within(appliedColumn).getByText('2')).toBeInTheDocument();
    expect(within(appliedColumn).getByRole('button', { name: /react dev/i })).toBeInTheDocument();
    expect(within(appliedColumn).getByRole('button', { name: /angular dev/i })).toBeInTheDocument();

    const offerColumn = screen.getByRole('region', { name: /offer/i });
    expect(within(offerColumn).getByRole('button', { name: /vue dev/i })).toBeInTheDocument();

    expect(screen.getAllByRole('region')).toHaveLength(5);
  });

  it('exposes cards as keyboard-focusable draggable items', () => {
    render(
      <KanbanBoard
        jobApplications={[buildJobApplication({ positionTitle: 'React Dev', companyName: 'Acme' })]}
        onStatusChange={vi.fn()}
      />,
    );

    const card = screen.getByRole('button', { name: 'React Dev at Acme' });
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAttribute('aria-roledescription', 'draggable application');
  });
});
