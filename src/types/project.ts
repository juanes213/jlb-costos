export type Item = {
  name: string;
  cost: number;
};

export type Category = {
  name: string;
  items: Item[];
};

export type Project = {
  id: string;
  name: string;
  categories: Category[];
};