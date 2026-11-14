'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { APPLICATION_STATUS_LABELS } from '../../constants/application-status-display';
import { APPLICATION_STATUSES, type ApplicationStatus } from '../../types/application-status';
import type { JobApplication } from '../../types/job-application';
import type { StatusChange } from '../../utils/apply-status-change';
import { groupByStatus } from '../../utils/group-by-status';
import { columnKeyboardCoordinates } from './column-keyboard-coordinates';
import { KanbanCardContent } from './kanban-card';
import { KanbanColumn } from './kanban-column';

interface KanbanBoardProps {
  jobApplications: JobApplication[];
  onStatusChange: (statusChange: StatusChange) => void;
}

const POINTER_ACTIVATION_DISTANCE_PX = 6;

const screenReaderInstructions = {
  draggable:
    'To move an application, press space or enter to pick it up. Use the left and right arrow keys to change column, space or enter to drop it, or escape to cancel.',
};

function describeApplication(jobApplication?: JobApplication): string {
  return jobApplication
    ? `${jobApplication.positionTitle} at ${jobApplication.companyName}`
    : 'Application';
}

function columnLabel(columnId?: string | number): string {
  return columnId ? APPLICATION_STATUS_LABELS[columnId as ApplicationStatus] : 'no column';
}

const announcements: Announcements = {
  onDragStart: ({ active }) =>
    `Picked up ${describeApplication(active.data.current as JobApplication)}.`,
  onDragOver: ({ over }) => `Over ${columnLabel(over?.id)}.`,
  onDragEnd: ({ active, over }) =>
    `Dropped ${describeApplication(active.data.current as JobApplication)} in ${columnLabel(over?.id)}.`,
  onDragCancel: ({ active }) =>
    `Cancelled. ${describeApplication(active.data.current as JobApplication)} was not moved.`,
};

const pointerFirstCollisionDetection: CollisionDetection = (collisionArgs) => {
  const pointerCollisions = pointerWithin(collisionArgs);
  return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(collisionArgs);
};

export function KanbanBoard({ jobApplications, onStatusChange }: KanbanBoardProps) {
  const [draggedApplication, setDraggedApplication] = useState<JobApplication>();
  const columns = groupByStatus(jobApplications);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: POINTER_ACTIVATION_DISTANCE_PX },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: columnKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDraggedApplication(active.data.current as JobApplication);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggedApplication(undefined);
    const movedApplication = active.data.current as JobApplication | undefined;
    const targetStatus = over?.id as ApplicationStatus | undefined;

    if (movedApplication && targetStatus && targetStatus !== movedApplication.status) {
      onStatusChange({ id: movedApplication.id, status: targetStatus });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerFirstCollisionDetection}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggedApplication(undefined)}
    >
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn key={status} status={status} jobApplications={columns[status]} />
        ))}
      </div>
      <DragOverlay>
        {draggedApplication && (
          <div className="rotate-2 cursor-grabbing rounded-md border border-blue-400 bg-white p-3 shadow-lg dark:bg-slate-900">
            <KanbanCardContent jobApplication={draggedApplication} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
