import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  addedBy: string;
  addedById: string;

}


// Fetch all products (public endpoint)
export const fetchProducts = createAsyncThunk<Product[]>(
  'products/fetchProducts',
  async () => {
    const response = await axiosInstance.get<Product[]>(`/api/products/getp`);
    return response.data;
  }
);

export const fetchProductsByUserId = createAsyncThunk<Product[], string>(
  'products/fetchProductsByUserId',
  async (userId) => {
    const response = await axiosInstance.get<Product[]>(`/api/products/getp?userId=${userId}`);
    return response.data;
  }
);



// Add a product (protected)
export const addProduct = createAsyncThunk<Product, Partial<Product>>(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<Product>>(
        '/api/products/createp', 
        productData
      );
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create product'
      );
    }
  }
);

// Update a product (protected)
export const updateProductById = createAsyncThunk<Product, Partial<Product>>(
  'products/updateProductById',
  async (updatedProduct, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<ApiResponse<Product>>('/api/products/updatep', updatedProduct);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error updating product');
    }
  }
);



// Delete a product (protected)
export const deleteProductById = createAsyncThunk<string, string>(
  'products/deleteProductById',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/api/products/deletep', {
        data: { id },
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete product'
      );
    }
  }
);