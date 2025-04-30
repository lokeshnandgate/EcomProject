import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/auth';
import { Product } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get the token from sessionStorage
const getToken = (): string | null => {
  const token = sessionStorage.getItem('token');
  return token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : null;
};

// 1. Fetch all products
export const fetchProducts = createAsyncThunk<Product[], void>(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Product[]>(`${API_BASE_URL}/api/products/getp`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// 2. Add a new product
export const addProduct = createAsyncThunk<Product, Omit<Product, '_id'>>(
  'products/add',
  async (productData, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue('Authorization token is missing.');

      const response = await axiosInstance.post<{ data: Product }>(
        `${API_BASE_URL}/api/products/createp`,
        productData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

// 3. Update a product by ID
export const updateProductById = createAsyncThunk<Product, Product>(
  'products/updateProductById',
  async (product, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/api/product/${product._id}`,
        product // this includes _id, title, etc.
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

// 4. Delete a product by ID
export const deleteProductById = createAsyncThunk<string, string>(
  'products/delete',
  async (productId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue('Authorization token is missing.');

      await axiosInstance.delete(`${API_BASE_URL}/api/products/deletep`, {
        headers: { Authorization: token },
        data: { id: productId },
      });
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);
