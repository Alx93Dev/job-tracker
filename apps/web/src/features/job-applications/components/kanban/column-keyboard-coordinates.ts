import type { KeyboardCoordinateGetter } from '@dnd-kit/core';
import { APPLICATION_STATUSES, type ApplicationStatus } from '../../types/application-status';
import type { JobApplication } from '../../types/job-application';

const COLUMN_DIRECTION_BY_KEY: Record<string, number> = {
  ArrowRight: 1,
  ArrowLeft: -1,
};
const COLUMN_DROP_OFFSET_PX = 12;

/**
 * dnd-kit moves keyboard drags in small pixel steps by default; on a board that means
 * many key presses to reach the next column. This jumps straight to the adjacent column.
 */
export const columnKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context },
) => {
  const direction = COLUMN_DIRECTION_BY_KEY[event.code];
  if (!direction) {
    return undefined;
  }
  event.preventDefault();

  const draggedApplication = context.active?.data.current as JobApplication | undefined;
  const currentStatus = (context.over?.id ?? draggedApplication?.status) as
    ApplicationStatus | undefined;
  const currentColumnIndex = currentStatus ? APPLICATION_STATUSES.indexOf(currentStatus) : -1;
  const targetStatus = APPLICATION_STATUSES[currentColumnIndex + direction];
  const targetColumnRect = targetStatus ? context.droppableRects.get(targetStatus) : undefined;

  if (!targetColumnRect) {
    return currentCoordinates;
  }

  return {
    x: targetColumnRect.left + COLUMN_DROP_OFFSET_PX,
    y: targetColumnRect.top + COLUMN_DROP_OFFSET_PX,
  };
};
