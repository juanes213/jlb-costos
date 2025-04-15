
import { useMemo } from "react";
import type { Project } from "@/types/project";

export function useDashboardAnalytics(
  filteredProjects: Project[],
  selectedProjects: string[],
  calculateProjectCost: (project: Project) => { totalCost: number; margin: number; marginPercentage: number; }
) {
  const analytics = useMemo(() => {
    const projectsToAnalyze = selectedProjects.length > 0
      ? filteredProjects.filter(p => selectedProjects.includes(p.id))
      : filteredProjects;
    
    const totalCost = projectsToAnalyze.reduce(
      (sum, project) => sum + calculateProjectCost(project).totalCost,
      0
    );
    
    const totalIncome = projectsToAnalyze.reduce(
      (sum, project) => sum + (project.income || 0),
      0
    );
    
    const totalMargin = totalIncome - totalCost;
    // Fix: Calculate margin percentage based on income
    const marginPercentage = totalIncome > 0 ? (totalMargin / totalIncome) * 100 : 0;
    
    // Calculate average project metrics
    const avgCost = projectsToAnalyze.length > 0 ? totalCost / projectsToAnalyze.length : 0;
    const avgIncome = projectsToAnalyze.length > 0 ? totalIncome / projectsToAnalyze.length : 0;
    const avgMargin = projectsToAnalyze.length > 0 ? totalMargin / projectsToAnalyze.length : 0;
    
    return {
      totalCost,
      totalIncome,
      totalMargin,
      marginPercentage: marginPercentage.toFixed(2),
      projectCount: projectsToAnalyze.length,
      avgCost,
      avgIncome,
      avgMargin
    };
  }, [filteredProjects, selectedProjects, calculateProjectCost]);

  return analytics;
}
