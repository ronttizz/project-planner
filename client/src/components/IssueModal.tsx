import { useEffect, useState } from "react";
import type { Issue } from "../types";

interface IssueModalProps {
  issue: Issue | null;
  isCreating: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string }) => void;
  onDelete?: () => void;
  isSaving?: boolean;
}

export function IssueModal({
  issue,
  isCreating,
  onClose,
  onSave,
  onDelete,
  isSaving,
}: IssueModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setTitle(issue?.title ?? "");
    setDescription(issue?.description ?? "");
  }, [issue]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!issue && !isCreating) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-lg bg-[var(--color-panel)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-modal-title"
      >
        <h2 id="issue-modal-title" className="mb-4 text-lg font-semibold">
          {isCreating ? "New issue" : "Edit issue"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="issue-title" className="mb-1 block text-sm font-medium">
              Title
            </label>
            <input
              id="issue-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>
          <div>
            <label htmlFor="issue-desc" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="issue-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <div>
              {!isCreating && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this issue?")) onDelete();
                  }}
                  className="text-sm text-[var(--color-danger)] hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-surface)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !title.trim()}
                className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
