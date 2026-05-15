import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

export async function moveIssue(
  issueId: string,
  targetColumnId: string,
  targetPosition: number,
) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) {
    throw new AppError(404, "Issue not found");
  }

  const targetColumn = await prisma.column.findFirst({
    where: { id: targetColumnId, projectId: issue.projectId },
  });
  if (!targetColumn) {
    throw new AppError(400, "Column does not belong to this project");
  }

  const clampedPosition = Math.max(0, targetPosition);
  const sameColumn = issue.columnId === targetColumnId;

  await prisma.$transaction(async (tx) => {
    if (sameColumn) {
      const issues = await tx.issue.findMany({
        where: { columnId: issue.columnId },
        orderBy: { position: "asc" },
      });
      const filtered = issues.filter((i) => i.id !== issueId);
      filtered.splice(clampedPosition, 0, issue);
      await Promise.all(
        filtered.map((i, index) =>
          tx.issue.update({ where: { id: i.id }, data: { position: index } }),
        ),
      );
    } else {
      const sourceIssues = await tx.issue.findMany({
        where: { columnId: issue.columnId, id: { not: issueId } },
        orderBy: { position: "asc" },
      });
      await Promise.all(
        sourceIssues.map((i, index) =>
          tx.issue.update({ where: { id: i.id }, data: { position: index } }),
        ),
      );

      const targetIssues = await tx.issue.findMany({
        where: { columnId: targetColumnId },
        orderBy: { position: "asc" },
      });
      const reordered = [...targetIssues];
      reordered.splice(clampedPosition, 0, {
        ...issue,
        columnId: targetColumnId,
      });
      await Promise.all(
        reordered.map((i, index) =>
          tx.issue.update({
            where: { id: i.id },
            data: {
              position: index,
              columnId: targetColumnId,
            },
          }),
        ),
      );
    }
  });

  return prisma.issue.findUnique({
    where: { id: issueId },
    include: { column: true },
  });
}
