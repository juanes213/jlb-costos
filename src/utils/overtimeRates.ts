
import { OvertimeRate, OvertimeType } from "@/types/project";

export const OVERTIME_RATES: OvertimeRate[] = [
  {
    type: "ordinary_daytime",
    name: "Hora ordinaria diurna",
    surchargePercentage: 0,
    surchargeMultiplier: 1
  },
  {
    type: "ordinary_night",
    name: "Hora ordinaria nocturna",
    surchargePercentage: 0.35,
    surchargeMultiplier: 1.35
  },
  {
    type: "ordinary_overtime",
    name: "Hora extra ordinaria",
    surchargePercentage: 0.25,
    surchargeMultiplier: 1.25
  },
  {
    type: "night_overtime",
    name: "Hora extra nocturna",
    surchargePercentage: 0.75,
    surchargeMultiplier: 1.75
  },
  {
    type: "sunday_daytime",
    name: "Hora ordinaria dominical diurna",
    surchargePercentage: 0.75,
    surchargeMultiplier: 1.75
  },
  {
    type: "sunday_night",
    name: "Hora ordinaria dominical nocturna",
    surchargePercentage: 1.10,
    surchargeMultiplier: 2.10
  },
  {
    type: "sunday_daytime_overtime",
    name: "Hora extra dominical diurna",
    surchargePercentage: 1.00,
    surchargeMultiplier: 2.00
  },
  {
    type: "sunday_night_overtime",
    name: "Hora extra dominical nocturna",
    surchargePercentage: 1.50,
    surchargeMultiplier: 2.50
  }
];

export const calculateOvertimeCost = (hourlyRate: number, overtimeType: OvertimeType, hours: number): number => {
  const rate = OVERTIME_RATES.find(r => r.type === overtimeType);
  if (!rate) return hourlyRate * hours;
  
  return hourlyRate * rate.surchargeMultiplier * hours;
};

export const getOvertimeRate = (overtimeType: OvertimeType): OvertimeRate | undefined => {
  return OVERTIME_RATES.find(r => r.type === overtimeType);
};
