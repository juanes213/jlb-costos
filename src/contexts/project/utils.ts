
import { Project } from "@/types/project";

// Storage key for local storage cache
export const PROJECTS_STORAGE_KEY = "jlb_projects_v1";

// Parse project data to ensure dates are properly formatted
export function parseProjectData(project: any): Project {
  // Ensure categories is always parsed as an array
  let categories = project.categories;
  
  try {
    // If categories is a string, try to parse it
    if (typeof categories === 'string') {
      categories = JSON.parse(categories);
    }
    
    // If parsing failed or categories is null/undefined, default to empty array
    if (!Array.isArray(categories)) {
      categories = [];
    }
  } catch (e) {
    console.error("Error parsing categories:", e);
    categories = [];
  }
  
  return {
    id: project.id,
    name: project.name,
    numberId: project.numberId || "",
    status: project.status,
    initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
    finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
    income: project.income || 0,
    categories: categories,
    observations: project.observations || undefined,
    quotes: project.quotes || []
  };
}

// Format project for Supabase storage
export const formatProjectForSupabase = (project: Project) => {
  // Ensure we're storing categories as a JSON string in Supabase
  const categoriesString = typeof project.categories === 'string' 
    ? project.categories 
    : JSON.stringify(project.categories);
    
  return {
    id: project.id,
    name: project.name,
    numberId: project.numberId,
    status: project.status,
    initialDate: project.initialDate ? project.initialDate.toISOString() : null,
    finalDate: project.finalDate ? project.finalDate.toISOString() : null,
    income: project.income,
    categories: categoriesString,
    observations: project.observations || null,
    quotes: project.quotes || [],
    updated_at: new Date().toISOString()
  };
};

// Stringify project for storage with proper date handling
export function stringifyProjects(projects: Project[]): string {
  return JSON.stringify(projects, (key, value) => {
    if (key === 'initialDate' || key === 'finalDate') {
      return value instanceof Date ? value.toISOString() : value;
    }
    return value;
  });
}

// Safely parse categories if needed
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

// Calculate project cost
export function calculateProjectCost(project: Project) {
  try {
    if (!project) {
      return { totalCost: 0, margin: 0, marginPercentage: 0 };
    }
    
    let totalCost = 0;
    
    // Ensure categories is an array before iterating
    const categories = ensureCategoriesArray(project.categories);

    categories.forEach(category => {
      // Process all categories, including "Personal" category
      if (typeof category.cost === 'number') {
        totalCost += category.cost;
      }
      
      if (typeof category.ivaAmount === 'number') {
        totalCost += category.ivaAmount;
      }
      
      if (Array.isArray(category.items)) {
        category.items.forEach(item => {
          if (typeof item.cost === 'number') {
            const itemCost = item.cost * (item.quantity || 1);
            totalCost += itemCost;
            
            if (typeof item.ivaAmount === 'number') {
              totalCost += item.ivaAmount;
            }
          }
          
          // Handle overtime records if present
          if (item.name === "Horas extras" && Array.isArray(item.overtimeRecords)) {
            item.overtimeRecords.forEach(record => {
              if (typeof record.cost === 'number') {
                totalCost += record.cost;
              }
            });
          }
        });
      }
    });

    const income = project.income || 0;
    const margin = income - totalCost;
    // Calculate margin percentage based on income, not on cost
    const marginPercentage = income > 0 ? (margin / income) * 100 : 0;

    return { totalCost, margin, marginPercentage };
  } catch (error) {
    console.error("Error calculating project cost:", error);
    return { totalCost: 0, margin: 0, marginPercentage: 0 };
  }
}
