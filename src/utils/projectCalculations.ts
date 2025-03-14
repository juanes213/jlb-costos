
import { Project } from "@/types/project";

export const calculateProjectCost = (project: Project): number => {
  let totalCost = 0;
  
  // Ensure categories is an array before using forEach
  const categories = Array.isArray(project.categories) 
    ? project.categories 
    : (typeof project.categories === 'string' ? JSON.parse(project.categories) : []);

  categories.forEach(category => {
    // Add category base cost if exists
    if (category.cost) {
      totalCost += category.cost;
    }
    
    // Add category IVA amount if exists
    if (category.ivaAmount) {
      totalCost += category.ivaAmount;
    }
    
    // Calculate cost from each item in the category
    category.items.forEach(item => {
      const quantity = item.quantity || 1;
      totalCost += item.cost * quantity;
      
      // Add item IVA amount if exists
      if (item.ivaAmount) {
        totalCost += item.ivaAmount;
      }
    });
  });
  
  return totalCost;
};
