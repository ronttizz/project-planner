import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { KanbanBoard } from "../components/KanbanBoard";
import { IssueModal } from "../components/IssueModal";
import type { Issue } from "../types";

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [creatingColumnId, setCreatingColumnId] = useState<string | null>(null);

  const { data: board, isLoading, error } = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => api.getBoard(projectId!),
    enabled: !!projectId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["board", projectId] });

  const moveMutation = useMutation({
    mutationFn: ({
      issueId,
      columnId,
      position,
    }: {
      issueId: string;
      columnId: string;
      position: number;
    }) => api.updateIssue(issueId, { columnId, position }),
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description: string; columnId: string }) =>
      api.createIssue(projectId!, {
        title: data.title,
        description: data.description || undefined,
        columnId: data.columnId,
      }),
    onSuccess: () => {
      invalidate();
      setCreatingColumnId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; title: string; description: string }) =>
      api.updateIssue(data.id, {
        title: data.title,
        description: data.description || null,
      }),
    onSuccess: () => {
      invalidate();
      setEditingIssue(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteIssue,
    onSuccess: () => {
      invalidate();
      setEditingIssue(null);
    },
  });

  const openIssue = (issueId: string) => {
    if (!board) return;
    for (const col of board.columns) {
      const issue = col.issues.find((i) => i.id === issueId);
      if (issue) {
        setEditingIssue(issue);
        return;
      }
    }
  };

  if (!projectId) {
    return <p className="p-8 text-[var(--color-danger)]">Invalid project</p>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4 shadow-sm">
        <Link
          to="/"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)]"
        >
          ← All projects
        </Link>
        {isLoading && (
          <h1 className="mt-2 text-xl font-semibold text-[var(--color-muted)]">
            Loading board…
          </h1>
        )}
        {board && (
          <>
            <h1 className="mt-2 text-xl font-semibold">{board.name}</h1>
            {board.description && (
              <p className="mt-1 text-sm text-[var(--color-muted)]">{board.description}</p>
            )}
          </>
        )}
        {error && (
          <p className="mt-2 text-sm text-[var(--color-danger)]">{error.message}</p>
        )}
      </header>

      <main className="flex-1 overflow-hidden px-6 py-6">
        {board && (
          <KanbanBoard
            board={board}
            onMoveIssue={(issueId, columnId, position) =>
              moveMutation.mutate({ issueId, columnId, position })
            }
            onIssueClick={openIssue}
            onAddIssue={(columnId) => setCreatingColumnId(columnId)}
          />
        )}
      </main>

      <IssueModal
        issue={editingIssue}
        isCreating={false}
        onClose={() => setEditingIssue(null)}
        onSave={(data) =>
          editingIssue &&
          updateMutation.mutate({ id: editingIssue.id, ...data })
        }
        onDelete={() => editingIssue && deleteMutation.mutate(editingIssue.id)}
        isSaving={updateMutation.isPending}
      />

      <IssueModal
        issue={null}
        isCreating={!!creatingColumnId}
        onClose={() => setCreatingColumnId(null)}
        onSave={(data) =>
          creatingColumnId &&
          createMutation.mutate({ ...data, columnId: creatingColumnId })
        }
        isSaving={createMutation.isPending}
      />
    </div>
  );
}
