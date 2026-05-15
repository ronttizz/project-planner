import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Issue } from "../types";

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: issue.id, data: { type: "issue", issue } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-grab rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-3 shadow-sm active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full text-left text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
      >
        {issue.title}
      </button>
      {issue.description && (
        <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">
          {issue.description}
        </p>
      )}
    </div>
  );
}
