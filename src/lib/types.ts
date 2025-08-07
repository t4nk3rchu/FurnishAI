export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Sofas' | 'Chairs' | 'Tables' | 'Beds';
  price: number;
  description: string;
  imageUrl: string;
  reviews: Review[];
}
