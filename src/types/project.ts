
export type StorageItem = {
  id: string;
  categoryName: string;
  name: string;
  cost: number;
  unit?: string;
  ivaAmount?: number;
  description?: string; // Add optional description field
};
