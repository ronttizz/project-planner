import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Board, Issue } from "../types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  board: Board;
  onMoveIssue: (issueId: string, columnId: string, position: number) => void;
  onIssueClick: (issueId: string) => void;
  onAddIssue: (columnId: string) => void;
}

function findIssue(board: Board, issueId: string) {
  for (const col of board.columns) {
    const issue = col.issues.find((i) => i.id === issueId);
    if (issue) return { issue, columnId: col.id };
  }
  return null;
}

export function KanbanBoard({
  board,
  onMoveIssue,
  onIssueClick,
  onAddIssue,
}: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const found = findIssue(board, String(event.active.id));
    if (found) setActiveIssue(found.issue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const found = findIssue(board, activeId);
    if (!found) return;

    let targetColumnId = found.columnId;
    let targetPosition = 0;

    const overData = over.data.current;
    if (overData?.type === "column") {
      targetColumnId = String(over.id);
      const col = board.columns.find((c) => c.id === targetColumnId);
      targetPosition = col ? col.issues.length : 0;
    } else {
      for (const col of board.columns) {
        const idx = col.issues.findIndex((i) => i.id === over.id);
        if (idx >= 0) {
          targetColumnId = col.id;
          targetPosition = idx;
          break;
        }
        if (col.id === over.id) {
          targetColumnId = col.id;
          targetPosition = col.issues.length;
          break;
        }
      }
    }

    const sourceCol = board.columns.find((c) => c.id === found.columnId);
    if (!sourceCol) return;

    const sourceIndex = sourceCol.issues.findIndex((i) => i.id === activeId);
    const targetCol = board.columns.find((c) => c.id === targetColumnId);
    if (!targetCol) return;

    if (found.columnId === targetColumnId) {
      const reordered = arrayMove(targetCol.issues, sourceIndex, targetPosition);
      targetPosition = reordered.findIndex((i) => i.id === activeId);
    }

    if (found.columnId !== targetColumnId || sourceIndex !== targetPosition) {
      onMoveIssue(activeId, targetColumnId, targetPosition);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onIssueClick={onIssueClick}
            onAddIssue={onAddIssue}
          />
        ))}
      </div>
      <DragOverlay>
        {activeIssue ? (
          <div className="w-72 rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-3 shadow-lg">
            <p className="text-sm font-medium">{activeIssue.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
