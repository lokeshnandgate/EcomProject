import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchProducts, addProduct, updateProductById, deleteProductById } from './action';

// Define the Product type directly here
interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
}

interface ProductState {
  list: Product[];
  loading: boolean;
  error: string | null;
  wishlist: Product[];
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
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.wishlist.find((item) => item._id === action.payload._id);
      if (!exists) {
        state.wishlist.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter((item) => item._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(addProduct.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateProductById.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteProductById.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      });
  },
});

export const { addToWishlist, removeFromWishlist } = productSlice.actions;
export default productSlice.reducer;
