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
    expect(within(appliedColumn).getByRole('article', { name: 'React Dev' })).toBeInTheDocument();
    expect(within(appliedColumn).getByRole('article', { name: 'Angular Dev' })).toBeInTheDocument();

    const offerColumn = screen.getByRole('region', { name: /offer/i });
    expect(within(offerColumn).getByRole('article', { name: 'Vue Dev' })).toBeInTheDocument();

    expect(screen.getAllByRole('region')).toHaveLength(5);
  });

  it('gives each card a keyboard drag handle that is not nested in another control', () => {
    render(
      <KanbanBoard
        jobApplications={[buildJobApplication({ positionTitle: 'React Dev', companyName: 'Acme' })]}
        onStatusChange={vi.fn()}
      />,
    );

    const card = screen.getByRole('article', { name: 'React Dev' });
    const dragHandle = within(card).getByRole('button', { name: 'Move React Dev at Acme' });
    expect(dragHandle).toHaveAttribute('aria-roledescription', 'draggable');
    expect(within(dragHandle).queryByRole('link')).not.toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Edit React Dev' })).toBeInTheDocument();
  });
});
