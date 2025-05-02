import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
// Define the Product type
interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
}


// Fetch all products
export const fetchProducts = createAsyncThunk<Product[]>(
  'products/fetchProducts',
  async () => {
    const response = await axios.get<Product[]>(`${API_URL}/api/products/getp`);
    return response.data;
  }
);

// Add a product
export const addProduct = createAsyncThunk<Product, Partial<Product>>(
  'products/addProduct',
  async (productData: Partial<Product>) => {
    const response = await axios.post<Product>(`${API_URL}/api/products/createp`, productData);
    return response.data;
  }
);

// Update a product
  export const updateProductById = createAsyncThunk<Product, Product>(
    'products/updateProduct',
    async (updatedProduct, { rejectWithValue }) => {
      try {
        const response = await axios.put<ApiResponse<Product>>(
          `${API_URL}/api/products/updatep`,
          {
            productId: updatedProduct._id,
            ...updatedProduct
          }
        );
        return response.data.data;
      } catch (err: any) {
        return rejectWithValue(
          err.response?.data?.message || 'Failed to update product'
        );
      }
    }
  );

// Delete a product
export const deleteProductById = createAsyncThunk<string, string>(
  'products/deleteProductById',
  async (id) => {
    await axios.delete(`${API_URL}/api/products/deletep`, {
      data: { id }, 
    });
    return id;
  }
);