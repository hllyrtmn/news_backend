// Category models

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent?: Category;
  icon?: string;
  color: string;
  is_active: boolean;
  article_count: number;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}
