
import { useMemo } from "react";
import type { Project } from "@/types/project";
import { format } from "date-fns";

export function useChartData(
  filteredProjects: Project[],
  selectedProjects: string[],
  calculateProjectCost: (project: Project) => { totalCost: number; margin: number; marginPercentage: number; }
) {
  const barChartData = useMemo(() => {
    const projectsToShow = selectedProjects.length > 0
      ? filteredProjects.filter(p => selectedProjects.includes(p.id))
      : filteredProjects.slice(0, 8);
    
    return projectsToShow.map(project => {
      const { totalCost: cost } = calculateProjectCost(project);
      return {
        name: project.name.length > 12 ? project.name.substring(0, 12) + '...' : project.name,
        cost,
        income: project.income || 0,
        margin: (project.income || 0) - cost,
      };
    });
  }, [filteredProjects, selectedProjects, calculateProjectCost]);

  const pieChartData = useMemo(() => {
    if (selectedProjects.length === 0 && filteredProjects.length > 0) {
      const project = filteredProjects[0];
      
      // Ensure categories is an array before mapping
      const categories = Array.isArray(project.categories) 
        ? project.categories 
        : (typeof project.categories === 'string' ? JSON.parse(project.categories) : []);
      
      return categories
        .filter(category => category.name !== "Personal")
        .map(category => {
          let categoryCost = category.cost || 0;
          
          if (Array.isArray(category.items)) {
            category.items.forEach(item => {
              categoryCost += (item.cost || 0) * (item.quantity || 1);
              if (item.ivaAmount) categoryCost += item.ivaAmount;
            });
          }
          
          if (category.ivaAmount) {
            categoryCost += category.ivaAmount;
          }
          
          return {
            name: category.name,
            value: categoryCost,
          };
        });
    } else if (selectedProjects.length === 1) {
      const project = filteredProjects.find(p => p.id === selectedProjects[0]);
      if (!project) return [];
      
      // Ensure categories is an array before mapping
      const categories = Array.isArray(project.categories) 
        ? project.categories 
        : (typeof project.categories === 'string' ? JSON.parse(project.categories) : []);
      
      return categories
        .filter(category => category.name !== "Personal")
        .map(category => {
          let categoryCost = category.cost || 0;
          
          if (Array.isArray(category.items)) {
            category.items.forEach(item => {
              categoryCost += (item.cost || 0) * (item.quantity || 1);
              if (item.ivaAmount) categoryCost += item.ivaAmount;
            });
          }
          
          if (category.ivaAmount) {
            categoryCost += category.ivaAmount;
          }
          
          return {
            name: category.name,
            value: categoryCost,
          };
        });
    } else {
      return selectedProjects.map(projectId => {
        const project = filteredProjects.find(p => p.id === projectId);
        if (!project) return { name: "", value: 0 };
        
        const { totalCost } = calculateProjectCost(project);
        return {
          name: project.name.length > 12 ? project.name.substring(0, 12) + '...' : project.name,
          value: totalCost,
        };
      });
    }
  }, [filteredProjects, selectedProjects, calculateProjectCost]);

  const scatterData = useMemo(() => {
    return filteredProjects.map(project => {
      const { totalCost: cost } = calculateProjectCost(project);
      const income = project.income || 0;
      return {
        name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
        cost,
        income,
        margin: income - cost
      };
    });
  }, [filteredProjects, calculateProjectCost]);

  const profitabilityDistribution = useMemo(() => {
    const margins = filteredProjects.map(project => {
      const { totalCost: cost } = calculateProjectCost(project);
      const income = project.income || 0;
      const margin = income - cost;
      const marginPercentage = income > 0 ? (margin / income) * 100 : 0;
      
      return {
        name: project.name,
        marginPercentage
      };
    });
    
    // Group by margin percentage ranges
    const ranges = [
      { range: '<-20%', count: 0 },
      { range: '-20% a -10%', count: 0 },
      { range: '-10% a 0%', count: 0 },
      { range: '0% a 10%', count: 0 },
      { range: '10% a 20%', count: 0 },
      { range: '20% a 30%', count: 0 },
      { range: '>30%', count: 0 }
    ];
    
    margins.forEach(item => {
      const mp = item.marginPercentage;
      if (mp < -20) ranges[0].count++;
      else if (mp < -10) ranges[1].count++;
      else if (mp < 0) ranges[2].count++;
      else if (mp < 10) ranges[3].count++;
      else if (mp < 20) ranges[4].count++;
      else if (mp < 30) ranges[5].count++;
      else ranges[6].count++;
    });
    
    return ranges;
  }, [filteredProjects, calculateProjectCost]);

  // New trend data for time series analysis
  const trendData = useMemo(() => {
    const projectsWithDates = filteredProjects
      .filter(project => project.initialDate)
      .sort((a, b) => {
        const dateA = a.initialDate instanceof Date ? a.initialDate : new Date(a.initialDate);
        const dateB = b.initialDate instanceof Date ? b.initialDate : new Date(b.initialDate);
        return dateA.getTime() - dateB.getTime();
      });

    return projectsWithDates.map(project => {
      const { totalCost: cost } = calculateProjectCost(project);
      const income = project.income || 0;
      const initialDate = project.initialDate instanceof Date 
        ? project.initialDate 
        : new Date(project.initialDate);
      
      return {
        date: format(initialDate, 'MMM yyyy'),
        cost,
        income,
        margin: income - cost,
        name: project.name
      };
    });
  }, [filteredProjects, calculateProjectCost]);

  return {
    barChartData,
    pieChartData,
    scatterData,
    profitabilityDistribution,
    trendData
  };
}
