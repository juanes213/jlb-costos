
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

export const calculateProjectCost = (project: Project): number => {
  let totalCost = 0;
  
  // Ensure categories is always an array before using forEach
  const categories = ensureCategoriesArray(project.categories);

  categories.forEach(category => {
    // Add category base cost if exists
    if (category.cost) {
      totalCost += category.cost;
    }
    
    // Add category IVA amount if exists
    if (category.ivaAmount) {
      totalCost += category.ivaAmount;
    }
    
    // Ensure items is an array before iterating
    if (Array.isArray(category.items)) {
      // Calculate cost from each item in the category
      category.items.forEach(item => {
        const quantity = item.quantity || 1;
        totalCost += item.cost * quantity;
        
        // Add item IVA amount if exists
        if (item.ivaAmount) {
          totalCost += item.ivaAmount;
        }
      });
    }
  });
  
  return totalCost;
};
