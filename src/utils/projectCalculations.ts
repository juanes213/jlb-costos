
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
          }
        });
      }
    });
    
    const income = project.income || 0;
    const margin = income - totalCost;
    const marginPercentage = totalCost > 0 ? (margin / totalCost) * 100 : 0;
    
    return { totalCost, margin, marginPercentage };
  } catch (error) {
    console.error("Error calculating project cost:", error);
    return { totalCost: 0, margin: 0, marginPercentage: 0 };
  }
};
