export interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image: string | File;
    inStock: boolean;
    createdAt?: string;
    updatedAt?: string;
  }