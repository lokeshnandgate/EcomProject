'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts,
  deleteProductById,
  updateProductById,
} from '@/app/redux/products/action';
import {fetchProfile} from'../redux/profile/action';
import { addToWishlist } from '@/app/redux/products/slice';
import { RootState } from '@/app/redux/store/store';
import Navbar from '../components/navbar/page';
import { AppDispatch } from '@/app/redux/store/store';
import { FiEdit, FiTrash2, FiHeart, FiSearch, FiX, FiCheck, FiUpload, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  inStock: boolean;
  addedBy: string;
  addedById: string;
}

const categoryIcons: Record<string, string> = {
  onlineProductMarketplace: '🛍️',
  foodDelivery: '🍽️',
  hotelBooking: '🏨',
  salonSpaBooking: '💇‍♀️',
  groceryDelivery: '🛒',
  eventTicketBooking: '🎫',
  rentalMarketplace: '🚗',
  digitalProductsStore: '💾',
  hyperlocalFarmDelivery: '🌿'
};

const categoryLabels: Record<string, string> = {
  onlineProductMarketplace: 'Online Marketplace',
  foodDelivery: 'Food Delivery',
  hotelBooking: 'Hotel Booking',
  salonSpaBooking: 'Salon & Spa',
  groceryDelivery: 'Grocery Delivery',
  eventTicketBooking: 'Event Tickets',
  rentalMarketplace: 'Rentals',
  digitalProductsStore: 'Digital Products',
  hyperlocalFarmDelivery: 'Farm Delivery'
};

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.products.list);
  const loading = useSelector((state: RootState) => state.products.loading);
  const businessInfo = useSelector((state: RootState) => state.business.businessInfo);
  const user = useSelector((state: RootState) => state.user);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image: '',
    inStock: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDelete = useCallback((id: string) => {
    setIsDeleting(id);
    setTimeout(() => {
      dispatch(deleteProductById(id));
      setIsDeleting(null);
    }, 800);
  }, [dispatch]);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image || '',
      inStock: product.inStock
    });
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const router = useRouter();
  const Gotoprofile = (product: Product) => {
    if (product.addedBy) {
      dispatch(fetchProfile(product.addedById));
      router.push(`/pages/profile/${product.addedById}`);
    }
  };
  
  const handleSubmit = async () => {
    if (!editingProduct) return;

    const updatedProduct = {
      ...formData,
      price: parseFloat(formData.price),
      inStock: Boolean(formData.inStock),
      addedBy: businessInfo._id,
      image: formData.image,
      productId: editingProduct._id,
    };

    await dispatch(updateProductById(updatedProduct));
    setShowModal(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((product: Product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (businessTypeFilter === '' || product.category === businessTypeFilter) &&
    product.addedBy !== undefined
  );

  // Check if current user is the owner of the product
  const isProductOwner = (product: Product) => {
    return user && product.addedById === user._id;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Product Dashboard</h1>
              <p className="text-gray-500 mt-2">
                Manage all your products in one place
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <select
                value={businessTypeFilter}
                onChange={(e) => setBusinessTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
              >
                <option value="">All Categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {categoryIcons[value]} {label}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-500 mr-2">
                  {filteredProducts.length} products
                </span>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${isDeleting === product._id ? 'opacity-0 scale-90 transition-all duration-300' : ''}`}
                  >
                    <div className="relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                        {categoryIcons[product.category]} {categoryLabels[product.category]}
                      </div>
                      {!product.inStock && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                          {product.title}
                        </h3>
                        <span className="text-lg font-bold text-indigo-600">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div 
                          className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                          onClick={() => Gotoprofile(product)}
                        >
                          <FiUser className="text-gray-500" />
                          <span>{product.addedBy.substring(0, 20)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => dispatch(addToWishlist(product))}
                            className="p-2 text-pink-500 hover:text-pink-700 transition-colors"
                            title="Add to wishlist"
                          >
                            <FiHeart />
                          </button>

                          {/* Only show edit/delete buttons if user is the product owner */}
                          {isProductOwner(product) && (
                            <>
                              <button
                                onClick={() => handleEditClick(product)}
                                className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                                title="Edit"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setBusinessTypeFilter('');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        placeholder="Product title"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Product description"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleFormChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      >
                        <option value="">Select a category</option>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {categoryIcons[value]} {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                      <div className="flex items-center gap-4">
                        {formData.image && (
                          <div className="relative">
                            <img
                              src={formData.image}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        <label className="flex-1">
                          <div className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                            <div className="flex flex-col items-center">
                              <FiUpload className="text-gray-400 mb-1" />
                              <span className="text-sm text-gray-500">
                                {formData.image ? 'Change image' : 'Upload image'}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="inStock"
                        name="inStock"
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                        In Stock
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <FiCheck /> Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}