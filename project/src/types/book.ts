export interface Category {
  id: number;
  name: string;
}

export interface Grade {
  id: number;
  name: string;
}

export interface BookType {
  id: number;
  title: string;
  author: string;
  category: number;
  categoryName?: string;
  grade: number;
  gradeName?: string;
  file_type: string;
  file_size_display: string;
  uploaded_at: string;
  selected?: boolean;
} 