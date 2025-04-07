
import { useState } from "react";
import type { Project } from "@/types/project";

export function useBaseCost(
  project: Project,
  categoryIndex: number,
  onUpdateProject: (project: Project) => void
) {
  const [categoryBaseCost, setCategoryBaseCost] = useState<string>(
    project.categories[categoryIndex].cost?.toString() || ""
  );

  const handleCategoryBaseCostChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setCategoryBaseCost(numericValue);

    const newProject = { ...project };
    newProject.categories[categoryIndex].cost = parseFloat(numericValue) || 0;
    onUpdateProject(newProject);
  };

  return {
    categoryBaseCost,
    handleCategoryBaseCostChange,
  };
}
