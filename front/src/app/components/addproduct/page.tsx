// app/components/add-product/page.tsx
'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addProduct } from '@/app/redux/products/action';

export default function AddProductPage() {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        title: '', description: '', price: '', category: '', image: '', inStock: true,
    });

    const handleFormChange = (e: any) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? e.target.checked : value;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        const productPayload = {
            ...formData,
            price: parseFloat(formData.price),
            inStock: Boolean(formData.inStock)
        };
        await dispatch<any>(addProduct(productPayload));
    };

    return (
        <div className="p-10 min-h-screen bg-gradient-to-br from-yellow-100 via-white to-yellow-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-10">Add New Product</h1>
                
                <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 relative border border-gray-200">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleFormChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData(prev => ({
                                                ...prev,
                                                image: reader.result as string,
                                            }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
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
                        onClick={async () => {
                            await handleSubmit();
                            alert('Product added successfully!');
                            window.location.href = '/dashboard';
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold px-4 py-3 rounded-lg transition"
                    >
                        Add Product
                    </button>
                </div>
            </div>
        </div>
    );
}