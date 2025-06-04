export interface BoardFilters {
  name?: string;
  updatedAfter?: Date;
  updatedBefore?: Date;
  limit?: number;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  updatedAt?: Date;
  createdAt?: Date;
  items?: any[];
  [key: string]: any;
}