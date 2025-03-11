
import type { Project } from "@/types/project";

export function calculateProjectCost(project: Project): number {
  let totalCost = 0;
  
  project.categories.forEach(category => {
    if (category.name === "Personal") {
      return;
    }
    
    if (category.cost) {
      totalCost += category.cost;
    }
    
    category.items.forEach(item => {
      const itemCost = (item.cost || 0) * (item.quantity || 1);
      totalCost += itemCost;
      
      if (item.ivaAmount) {
        totalCost += item.ivaAmount;
      }
    });
  });
  
  return totalCost;
}
