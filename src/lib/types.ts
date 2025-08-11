export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Sofas' | 'Chair' | 'Table' | 'Bed' | string;
  price: number;
  description: string;
  imageUrl: string;
  reviews: Review[];
}
