'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProducts,
    deleteProductById,
    updateProductById,
    addProduct
} from '@/app/redux/products/action';
import { addToWishlist, clearError } from '@/app/redux/products/slice';
import { RootState, AppDispatch } from '@/app/redux/store/store';
import Navbar from '../components/navbar/page';
import { Product } from '@/app/redux/products/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { list: products, loading, error } = useSelector((state: RootState) => state.products);

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

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleDelete = async (id: string) => {
        try {
            await dispatch(deleteProductById(id)).unwrap();
            toast.success('Product deleted successfully');
            dispatch(fetchProducts());
        } catch {
            toast.error('Failed to delete product');
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            image: typeof product.image === 'string' ? product.image : '',
            inStock: product.inStock
        });
        setShowModal(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.price || !formData.category) {
            toast.error('Please fill out all required fields.');
            return;
        }

        const productPayload = {
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            image: formData.image,
            inStock: Boolean(formData.inStock)
        };

        try {
            if (editingProduct && editingProduct._id) {
                await dispatch(updateProductById({ ...productPayload, _id: editingProduct._id })).unwrap();
                toast.success('Product updated successfully');
            } else {
                await dispatch(addProduct(productPayload)).unwrap();
                toast.success('Product added successfully');
            }

            setShowModal(false);
            setEditingProduct(null);
            dispatch(fetchProducts());
        } catch (err) {
            toast.error('Failed to save product');
        }
    };

    const handleAddNewProduct = () => {
        setEditingProduct(null);
        setFormData({
            title: '',
            description: '',
            price: '',
            category: '',
            image: '',
            inStock: true
        });
        setShowModal(true);
    };

    const filteredProducts = Array.isArray(products) ? products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (businessTypeFilter === '' || product.category === businessTypeFilter)
    ) : [];

    return (
        <>
            <Navbar />
            <ToastContainer position="top-right" autoClose={5000} />
            {/* Main container */}
            <div className="p-10 min-h-screen bg-gradient-to-br from-yellow-100 via-white to-yellow-50">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Product Dashboard</h1>
                    <button
                        onClick={handleAddNewProduct}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition duration-200"
                    >
                        + Add Product
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-8 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full px-4 py-3 border border-yellow-400 rounded-xl shadow-md placeholder-gray-500 text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                    />
                    <select
                        value={businessTypeFilter}
                        onChange={(e) => setBusinessTypeFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-yellow-400 rounded-xl shadow-md text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition bg-white"
                    >
                        <option value="">All Business Types</option>
                        <option value="onlineProductMarketplace">🛍 Online Product Marketplace</option>
                        <option value="foodDelivery">🍽 Food Delivery & Table Booking</option>
                        <option value="hotelBooking">🏨 Hotel & Room Booking</option>
                        <option value="salonSpaBooking">💇‍♀️ Salon & Spa Booking</option>
                        <option value="groceryDelivery">🛒 Grocery & Essentials Delivery</option>
                        <option value="eventTicketBooking">🎫 Event Ticket Booking</option>
                        <option value="rentalMarketplace">🚗 Rental Marketplace</option>
                        <option value="digitalProductsStore">💾 Digital Products Store</option>
                        <option value="hyperlocalFarmDelivery">🌿 Hyperlocal Farm/Food Delivery</option>
                    </select>
                </div>

                {/* Product grid */}
                {loading ? (
                    <p className="text-center text-lg text-gray-600 animate-pulse">Loading products...</p>
                ) : (
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition p-5 flex flex-col border border-gray-200"
                            >
                                {product.image && (
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-48 object-cover rounded-xl mb-4 shadow-md"
                                    />
                                )}
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{product.title}</h3>
                                <p className="text-sm text-gray-500 mb-2 italic">{product.category}</p>
                                <p className="text-sm text-gray-600 flex-1">{product.description}</p>
                                <p className="text-lg font-bold text-green-700 mt-4">₹{product.price}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => dispatch(addToWishlist(product))}
                                        className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full font-medium hover:bg-pink-200 transition"
                                    >
                                        ❤️ Wishlist
                                    </button>
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full font-medium hover:bg-blue-200 transition"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full font-medium hover:bg-red-200 transition"
                                    >
                                        ❌ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg space-y-6 relative border border-gray-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-5 text-gray-700 hover:text-red-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 text-center">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        placeholder="Title"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        placeholder="Description"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        placeholder="Price"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type*</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="onlineProductMarketplace">🛍 Online Product Marketplace</option>
                                        <option value="foodDelivery">🍽 Food Delivery & Table Booking</option>
                                        <option value="hotelBooking">🏨 Hotel & Room Booking</option>
                                        <option value="salonSpaBooking">💇‍♀️ Salon & Spa Booking</option>
                                        <option value="groceryDelivery">🛒 Grocery & Essentials Delivery</option>
                                        <option value="eventTicketBooking">🎫 Event Ticket Booking</option>
                                        <option value="rentalMarketplace">🚗 Rental Marketplace</option>
                                        <option value="digitalProductsStore">💾 Digital Products Store</option>
                                        <option value="hyperlocalFarmDelivery">🌿 Hyperlocal Farm/Food Delivery</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        image: reader.result as string
                                                    }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {formData.image && (
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="mt-4 w-full h-48 object-cover rounded-xl shadow-md"
                                        />
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        id="inStock"
                                        name="inStock"
                                        type="checkbox"
                                        checked={formData.inStock}
                                        onChange={handleFormChange}
                                        className="h-4 w-4 border-gray-300 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="inStock" className="text-sm text-gray-700">
                                        In Stock
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold px-4 py-3 rounded-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-green-800'}`}
                            >
                                {loading ? 'Processing...' : editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
