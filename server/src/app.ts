import express from "express";
import cors from "cors";
import { projectsRouter } from "./routes/projects.js";
import { issuesRouter } from "./routes/issues.js";
import { errorHandler } from "./middleware/errorHandler.js";

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

export const app = express();

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/projects", projectsRouter);
app.use("/api/issues", issuesRouter);

app.use(errorHandler);
