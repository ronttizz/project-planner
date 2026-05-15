const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }
  return data as T;
}

export const api = {
  getProjects: () => request<import("../types").Project[]>("/projects"),

  createProject: (body: { name: string; description?: string }) =>
    request<import("../types").Project>("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteProject: (id: string) =>
    request<void>(`/projects/${id}`, { method: "DELETE" }),

  getBoard: (projectId: string) =>
    request<import("../types").Board>(`/projects/${projectId}/board`),

  createIssue: (
    projectId: string,
    body: { title: string; description?: string; columnId: string },
  ) =>
    request<import("../types").Issue>(`/projects/${projectId}/issues`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateIssue: (
    id: string,
    body: {
      title?: string;
      description?: string | null;
      columnId?: string;
      position?: number;
    },
  ) =>
    request<import("../types").Issue>(`/issues/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteIssue: (id: string) =>
    request<void>(`/issues/${id}`, { method: "DELETE" }),
};
