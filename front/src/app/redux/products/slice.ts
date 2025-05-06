import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchProducts, addProduct, updateProductById, deleteProductById } from './action';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  addedBy: string;
}

interface ProductState {
  list: Product[];
  loading: boolean;
  error: string | null;
  wishlist: Product[];
  operationError: string | null; 
}

const initialState: ProductState = {
  list: [],
  loading: false,
  error: null,
  wishlist: [],
  operationError: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.wishlist.find((item) => item._id === action.payload._id);
      if (!exists) {
        state.wishlist.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter((item) => item._id !== action.payload);
    },
    clearOperationError: (state) => {
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      
      // Add Product
      .addCase(addProduct.pending, (state) => {
        state.operationError = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.operationError = action.payload as string || 'Failed to add product';
      })
      
      // Update Product
      .addCase(updateProductById.pending, (state) => {
        state.operationError = null;
      })
      .addCase(updateProductById.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateProductById.rejected, (state, action) => {
        state.operationError = action.payload as string || 'Failed to update product';
      })
      
      // Delete Product
      .addCase(deleteProductById.pending, (state) => {
        state.operationError = null;
      })
      .addCase(deleteProductById.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProductById.rejected, (state, action) => {
        state.operationError = action.payload as string || 'Failed to delete product';
      });
  },
});

export const { 
  addToWishlist, 
  removeFromWishlist,
  clearOperationError 
} = productSlice.actions;

export default productSlice.reducer;