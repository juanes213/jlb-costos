export type Item = {
  name: string;
  cost: number;
  ivaAmount?: number;
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
  categories: Category[];
  initialDate?: Date;
  finalDate?: Date;
  status: ProjectStatus;
};