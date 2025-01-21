export type Item = {
  name: string;
  cost: number;
};

export type Category = {
  name: string;
  items: Item[];
  cost?: number;
};

export type Project = {
  id: string;
  numberId: number;
  name: string;
  categories: Category[];
  finalDate?: Date;
};