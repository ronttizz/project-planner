import { Routes, Route } from "react-router-dom";
import { ProjectListPage } from "./pages/ProjectListPage";
import { BoardPage } from "./pages/BoardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectListPage />} />
      <Route path="/projects/:projectId" element={<BoardPage />} />
    </Routes>
  );
}
