import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export function ProjectListPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
  });

  const createMutation = useMutation({
    mutationFn: () => api.createProject({ name, description: description || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setName("");
      setDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Project Planner</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Kanban boards for your projects
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">New project</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                placeholder="My project"
              />
            </div>
            <div>
              <label htmlFor="desc" className="mb-1 block text-sm font-medium">
                Description (optional)
              </label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
            {createMutation.isError && (
              <p className="text-sm text-[var(--color-danger)]">
                {createMutation.error.message}
              </p>
            )}
            <button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating…" : "Create project"}
            </button>
          </form>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-medium">Your projects</h2>
          {isLoading && (
            <p className="text-sm text-[var(--color-muted)]">Loading projects…</p>
          )}
          {error && (
            <p className="text-sm text-[var(--color-danger)]">{error.message}</p>
          )}
          {!isLoading && !error && projects?.length === 0 && (
            <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-8 text-center text-sm text-[var(--color-muted)]">
              No projects yet. Create one above to get started.
            </p>
          )}
          <ul className="space-y-3">
            {projects?.map((project) => (
              <li
                key={project.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 shadow-sm"
              >
                <div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="font-medium text-[var(--color-accent)] hover:underline"
                  >
                    {project.name}
                  </Link>
                  {project.description && (
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {project.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {project._count?.issues ?? 0} issues
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete project "${project.name}"?`)) {
                      deleteMutation.mutate(project.id);
                    }
                  }}
                  className="text-sm text-[var(--color-danger)] hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
