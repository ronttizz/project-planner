import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { moveIssue } from "../services/issueMove.js";

const updateIssueSchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(5000).nullable().optional(),
    columnId: z.string().min(1).optional(),
    position: z.number().int().min(0).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      (data.columnId !== undefined && data.position !== undefined),
    { message: "No valid fields to update" },
  );

export const issuesRouter = Router();

issuesRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = updateIssueSchema.parse(req.body);
    const issue = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!issue) throw new AppError(404, "Issue not found");

    if (body.columnId !== undefined && body.position !== undefined) {
      const moved = await moveIssue(req.params.id, body.columnId, body.position);
      res.json(moved);
      return;
    }

    const updated = await prisma.issue.update({
      where: { id: req.params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

issuesRouter.delete("/:id", async (req, res, next) => {
  try {
    const issue = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!issue) throw new AppError(404, "Issue not found");

    await prisma.$transaction(async (tx) => {
      await tx.issue.delete({ where: { id: req.params.id } });
      const remaining = await tx.issue.findMany({
        where: { columnId: issue.columnId },
        orderBy: { position: "asc" },
      });
      await Promise.all(
        remaining.map((i, index) =>
          tx.issue.update({ where: { id: i.id }, data: { position: index } }),
        ),
      );
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
