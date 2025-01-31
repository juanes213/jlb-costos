export type Item = {
  name: string;
  cost: number;
  quantity?: number;
  ivaAmount?: number;
};

export type StorageItem = {
  id: string;
  categoryName: string;
  name: string;
  cost: number;
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
};