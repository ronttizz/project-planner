import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

const DEFAULT_COLUMNS = ["To Do", "In Progress", "Done"];

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
});

const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  columnId: z.string().min(1),
});

export const projectsRouter = Router();

projectsRouter.get("/", async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: { select: { issues: true } },
      },
    });
    res.json(projects);
  } catch (e) {
    next(e);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const body = createProjectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        columns: {
          create: DEFAULT_COLUMNS.map((name, position) => ({ name, position })),
        },
      },
      include: { columns: { orderBy: { position: "asc" } } },
    });
    res.status(201).json(project);
  } catch (e) {
    next(e);
  }
});

projectsRouter.get("/:id", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) throw new AppError(404, "Project not found");
    res.json(project);
  } catch (e) {
    next(e);
  }
});

projectsRouter.delete("/:id", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) throw new AppError(404, "Project not found");
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

projectsRouter.get("/:id/board", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            issues: { orderBy: { position: "asc" } },
          },
        },
      },
    });
    if (!project) throw new AppError(404, "Project not found");
    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      columns: project.columns,
    });
  } catch (e) {
    next(e);
  }
});

projectsRouter.post("/:id/issues", async (req, res, next) => {
  try {
    const body = createIssueSchema.parse(req.body);
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) throw new AppError(404, "Project not found");

    const column = await prisma.column.findFirst({
      where: { id: body.columnId, projectId: req.params.id },
    });
    if (!column) throw new AppError(400, "Invalid column for this project");

    const maxPosition = await prisma.issue.aggregate({
      where: { columnId: body.columnId },
      _max: { position: true },
    });
    const position = (maxPosition._max.position ?? -1) + 1;

    const issue = await prisma.issue.create({
      data: {
        projectId: req.params.id,
        columnId: body.columnId,
        title: body.title,
        description: body.description,
        position,
      },
    });
    res.status(201).json(issue);
  } catch (e) {
    next(e);
  }
});
