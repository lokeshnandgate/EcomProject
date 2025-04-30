import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchProducts,
  addProduct,
  updateProductById,
  deleteProductById,
} from './action';
import { Product } from './types';

interface ProductState {
  list: Product[];            // List of products (array of Product objects)
  loading: boolean;           // Loading state for async actions
  error: string | null;       // Error state for handling errors
  wishlist: Product[];        // Wishlist state for managing wishlist products
}

const initialState: ProductState = {
  list: [],
  loading: false,
  error: null,
  wishlist: [],
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Add a product to the wishlist
    addToWishlist: (state, action: PayloadAction<Product>) => {
      if (!state.wishlist.some(item => item._id === action.payload._id)) {
        state.wishlist.push(action.payload);
      }
    },

    // Remove a product from the wishlist
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter(item => item._id !== action.payload);
    },

    // Clear error messages
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add a new product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.list.unshift(action.payload);  // Adds new product at the beginning
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update an existing product
      .addCase(updateProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        const index = state.list.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete a product
      .addCase(deleteProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductById.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.list = state.list.filter(product => product._id !== action.payload);
      })
      .addCase(deleteProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions to manage wishlist and errors
export const { addToWishlist, removeFromWishlist, clearError } = productSlice.actions;

export default productSlice.reducer;
