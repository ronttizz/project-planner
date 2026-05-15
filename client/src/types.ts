export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: { issues: number };
}

export interface Issue {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  projectId: string;
  name: string;
  position: number;
  issues: Issue[];
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  columns: Column[];
}
