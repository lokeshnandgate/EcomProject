import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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
}

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fetch all products (public endpoint)
export const fetchProducts = createAsyncThunk<Product[]>(
  'products/fetchProducts',
  async () => {
    const response = await api.get<Product[]>(`/api/products/getp`);
    return response.data;
  }
);

// In your products/action.ts
export const fetchMyProducts = createAsyncThunk<Product[]>(
  'products/fetchMyProducts',
  async () => {
    const response = await api.get<Product[]>('/api/products/my-products');
    return response.data;
  }
);




// Add a product (protected)
export const addProduct = createAsyncThunk<Product, Partial<Product>>(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<Product>>(
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
export const updateProductById = createAsyncThunk<Product, Product>(
  'products/updateProduct',
  async (updatedProduct, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<Product>>(
        '/api/products/updatep',
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

// Delete a product (protected)
export const deleteProductById = createAsyncThunk<string, string>(
  'products/deleteProductById',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete('/api/products/deletep', {
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