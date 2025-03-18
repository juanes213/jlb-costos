
export type Item = {
  name: string;
  cost: number;
  quantity?: number;
  ivaAmount?: number;
  unit?: string;
  overtimeRecords?: OvertimeRecord[];
};

export type OvertimeRecord = {
  id: string;
  employeeId: string;
  overtimeType: OvertimeType;
  hours: number;
  cost: number;
};

export type StorageItem = {
  id: string;
  categoryName: string;
  name: string;
  cost: number;
  unit?: string;
  ivaAmount?: number;
};

export type OvertimeType = 
  | "ordinary_daytime" 
  | "ordinary_night" 
  | "ordinary_overtime" 
  | "night_overtime" 
  | "sunday_daytime" 
  | "sunday_night" 
  | "sunday_daytime_overtime" 
  | "sunday_night_overtime";

export type OvertimeRate = {
  type: OvertimeType;
  name: string;
  surchargePercentage: number;
  surchargeMultiplier: number;
};

export type Employee = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  salary: number;
  position: string;
  group: string;
  hourlyRate: number;
  dailyRate: number;
};

export type Category = {
  name: string;
  items: Item[];
  cost?: number;
  ivaAmount?: number;
};

export type ProjectStatus = "in-process" | "on-hold" | "paused" | "completed";

export type Project = {
  id: string;
  numberId: string;
  name: string;
  income: number;
  categories: Category[];
  initialDate?: Date;
  finalDate?: Date;
  status: ProjectStatus;
  observations?: string;
};
