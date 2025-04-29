
import { useMemo } from "react";
import type { Project } from "@/types/project";

// Helper function to ensure categories is an array
function ensureCategoriesArray(categories: any) {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;
  if (typeof categories === 'string') {
    try {
      const parsed = JSON.parse(categories);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing categories:", e);
      return [];
    }
  }
  return [];
}

export function useDashboardAnalytics(
  filteredProjects: Project[],
  selectedProjects: string[],
  calculateProjectCost: (project: Project) => { totalCost: number; margin: number; marginPercentage: number; }
) {
  const analytics = useMemo(() => {
    try {
      console.log('Running dashboard analytics calculations');
      
      const projectsToAnalyze = selectedProjects.length > 0
        ? filteredProjects.filter(p => selectedProjects.includes(p.id))
        : filteredProjects;
      
      // Add logging to debug cost calculation
      console.log('Projects to analyze:', projectsToAnalyze.length);
      
      const totalCost = projectsToAnalyze.reduce(
        (sum, project) => {
          // Ensure project has categories as an array before calculating costs
          if (project) {
            project = {
              ...project,
              categories: ensureCategoriesArray(project.categories)
            };
          }
          
          const result = calculateProjectCost(project);
          console.log(`Project ${project.name} cost:`, result.totalCost);
          return sum + result.totalCost;
        },
        0
      );
      
      console.log('Total calculated cost:', totalCost);
      
      const totalIncome = projectsToAnalyze.reduce(
        (sum, project) => sum + (project.income || 0),
        0
      );
      
      console.log('Total income:', totalIncome);
      
      const totalMargin = totalIncome - totalCost;
      // Calculate margin percentage based on income
      const marginPercentage = totalIncome > 0 ? (totalMargin / totalIncome) * 100 : 0;
      
      // Calculate average project metrics
      const avgCost = projectsToAnalyze.length > 0 ? totalCost / projectsToAnalyze.length : 0;
      const avgIncome = projectsToAnalyze.length > 0 ? totalIncome / projectsToAnalyze.length : 0;
      const avgMargin = projectsToAnalyze.length > 0 ? totalMargin / projectsToAnalyze.length : 0;
      
      console.log('Final analytics:', {
        totalCost,
        totalIncome,
        totalMargin,
        marginPercentage,
        avgCost,
        avgIncome,
        avgMargin
      });
      
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
    } catch (error) {
      console.error("Error in useDashboardAnalytics:", error);
      return {
        totalCost: 0,
        totalIncome: 0,
        totalMargin: 0,
        marginPercentage: "0.00",
        projectCount: 0,
        avgCost: 0,
        avgIncome: 0,
        avgMargin: 0
      };
    }
  }, [filteredProjects, selectedProjects, calculateProjectCost]);

  return analytics;
}
