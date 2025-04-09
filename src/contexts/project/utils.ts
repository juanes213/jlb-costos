
import { Project } from "@/types/project";

// Storage key for local storage cache
export const PROJECTS_STORAGE_KEY = "jlb_projects_v1";

// Parse project data to ensure dates are properly formatted
export function parseProjectData(project: any): Project {
  return {
    ...project,
    initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
    finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
  };
}

// Format project for Supabase storage
export function formatProjectForSupabase(project: Project) {
  return {
    id: project.id,
    name: project.name,
    numberId: project.numberId || '',
    status: project.status,
    initialDate: project.initialDate ? project.initialDate.toISOString() : null,
    finalDate: project.finalDate ? project.finalDate.toISOString() : null,
    income: project.income || 0,
    categories: project.categories,
    observations: project.observations || null
  };
}

// Stringify project for storage with proper date handling
export function stringifyProjects(projects: Project[]): string {
  return JSON.stringify(projects, (key, value) => {
    if (key === 'initialDate' || key === 'finalDate') {
      return value instanceof Date ? value.toISOString() : value;
    }
    return value;
  });
}

// Calculate project cost
export function calculateProjectCost(project: Project) {
  let totalCost = 0;

  project.categories.forEach(category => {
    if (category.name !== "Personal") {
      if (category.cost) {
        totalCost += category.cost;
      }
      
      category.items.forEach(item => {
        const itemCost = item.cost * (item.quantity || 1);
        totalCost += itemCost;
        
        if (item.ivaAmount) {
          totalCost += item.ivaAmount;
        }
      });
    }
  });
  
  const personalCategory = project.categories.find(cat => cat.name === "Personal");
  if (personalCategory) {
    personalCategory.items.forEach(item => {
      if (item.name === "Horas extras" && item.overtimeRecords) {
        item.overtimeRecords.forEach(record => {
          totalCost += record.cost;
        });
      } else {
        const itemCost = item.cost * (item.quantity || 1);
        totalCost += itemCost;
      }
    });
  }

  const margin = project.income - totalCost;
  const marginPercentage = totalCost > 0 ? (margin / totalCost) * 100 : 0;

  return { totalCost, margin, marginPercentage };
}
