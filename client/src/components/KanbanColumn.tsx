import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column } from "../types";
import { IssueCard } from "./IssueCard";

interface KanbanColumnProps {
  column: Column;
  onIssueClick: (issueId: string) => void;
  onAddIssue: (columnId: string) => void;
}

export function KanbanColumn({ column, onIssueClick, onAddIssue }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const issueIds = column.issues.map((i) => i.id);

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-lg bg-[#ebecf0] ${
        isOver ? "ring-2 ring-[var(--color-accent)]" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {column.name}
        </h3>
        <span className="rounded-full bg-[#dfe1e6] px-2 py-0.5 text-xs font-medium text-[var(--color-muted)]">
          {column.issues.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className="flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
      >
        <SortableContext items={issueIds} strategy={verticalListSortingStrategy}>
          {column.issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onIssueClick(issue.id)}
            />
          ))}
        </SortableContext>
        {column.issues.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-[var(--color-muted)]">
            No issues
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onAddIssue(column.id)}
        className="m-2 rounded border border-dashed border-[var(--color-border)] bg-transparent py-2 text-sm text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        + Add issue
      </button>
    </div>
  );
}
