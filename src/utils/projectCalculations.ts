
import { Project } from "@/types/project";

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

export const calculateProjectCost = (project: Project): {
  totalCost: number;
  margin: number;
  marginPercentage: number;
} => {
  try {
    if (!project) {
      return { totalCost: 0, margin: 0, marginPercentage: 0 };
    }
    
    let totalCost = 0;
    
    // Ensure categories is always an array before using forEach
    const categories = ensureCategoriesArray(project.categories);
    
    // Add debug logging
    console.log('Project:', project.name, 'Categories:', categories);

    // Process all categories
    categories.forEach(category => {
      // Add category base cost if exists
      if (category && typeof category.cost === 'number') {
        totalCost += category.cost;
      }
      
      // Add category IVA amount if exists
      if (category && typeof category.ivaAmount === 'number') {
        totalCost += category.ivaAmount;
      }
      
      // Ensure items is an array before iterating
      if (category && Array.isArray(category.items)) {
        // Calculate cost from each item in the category
        category.items.forEach(item => {
          if (item && typeof item.cost === 'number') {
            const quantity = item.quantity || 1;
            totalCost += item.cost * quantity;
            
            // Add item IVA amount if exists
            if (typeof item.ivaAmount === 'number') {
              totalCost += item.ivaAmount;
            }
            
            // Handle overtime records if present
            if (item.name === "Horas extras" && Array.isArray(item.overtimeRecords)) {
              item.overtimeRecords.forEach(record => {
                if (typeof record.cost === 'number') {
                  totalCost += record.cost;
                }
              });
            }
          }
        });
      }
    });
    
    console.log('Project:', project.name, 'Total Cost:', totalCost);
    
    const income = project.income || 0;
    const margin = income - totalCost;
    
    // Calculate margin percentage based on income, not on cost
    // Only calculate if income is greater than zero to avoid division by zero
    const marginPercentage = income > 0 ? (margin / income) * 100 : 0;
    
    return { totalCost, margin, marginPercentage };
  } catch (error) {
    console.error("Error calculating project cost:", error);
    return { totalCost: 0, margin: 0, marginPercentage: 0 };
  }
};
