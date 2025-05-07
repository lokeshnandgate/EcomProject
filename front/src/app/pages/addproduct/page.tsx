'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addProduct } from '@/app/redux/products/action';
import { 
  FiPlusCircle, FiDollarSign, FiType, FiFileText, 
  FiImage, FiCheck, FiShoppingBag, FiCoffee, 
  FiHome, FiScissors, FiShoppingCart, 
  FiTruck, FiHardDrive, FiPackage 
} from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';

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
        <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full shadow-lg mr-4">
                        <FiPlusCircle className="text-white text-2xl" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                        Add New Product
                    </h1>
                </div>
                
                <div className="bg-white rounded-3xl shadow-lg p-8 space-y-8 border border-gray-100">
                    <div className="space-y-6">
                        {/* Title Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
                                <FiType className="text-xl" />
                            </div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Title*</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                                placeholder="Product Title"
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                required
                            />
                        </div>

                        {/* Description Field */}
                        <div className="relative">
                            <div className="absolute top-8 left-3 text-blue-600">
                                <FiFileText className="text-xl" />
                            </div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                placeholder="Product description..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                rows={4}
                            />
                        </div>

                        {/* Price Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-600">
                                <FiDollarSign className="text-xl" />
                            </div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Price*</label>
                            <input
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleFormChange}
                                placeholder="0.00"
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                step="0.01"
                                required
                            />
                        </div>

                        {/* Category Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-600">
                                <FaStore className="text-xl" />
                            </div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Business Type</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleFormChange}
                                className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none"
                            >
                                <option value="">Select Business Type</option>
                                <option value="onlineProductMarketplace">Online Product Marketplace</option>
                                <option value="foodDelivery">Food Delivery & Table Booking</option>
                                <option value="hotelBooking">Hotel & Room Booking</option>
                                <option value="salonSpaBooking">Salon & Spa Booking</option>
                                <option value="groceryDelivery">Grocery & Essentials Delivery</option>
                                <option value="eventTicketBooking">Event Ticket Booking</option>
                                <option value="rentalMarketplace">Rental Marketplace</option>
                                <option value="digitalProductsStore">Digital Products Store</option>
                                <option value="hyperlocalFarmDelivery">Hyperlocal Farm/Food Delivery</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="relative">
                            <div className="absolute top-8 left-3 text-blue-600">
                                <FiImage className="text-xl" />
                            </div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Product Image</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
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
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="text-center">
                                    <FiImage className="mx-auto text-3xl text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        {formData.image ? 'Change image' : 'Click to upload product image'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                                </div>
                            </div>
                            {formData.image && (
                                <div className="mt-4 relative group">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg shadow-sm border-2 border-gray-200"
                                    />
                                    <button
                                        onClick={() => setFormData(prev => ({...prev, image: ''}))}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* In Stock Checkbox */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="relative flex items-center">
                                <input
                                    id="inStock"
                                    name="inStock"
                                    type="checkbox"
                                    checked={formData.inStock}
                                    onChange={handleFormChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </div>
                            <label htmlFor="inStock" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <FiCheck className="text-green-600" />
                                <span>Currently in stock</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={async () => {
                            await handleSubmit();
                            alert('Product added successfully!');
                            window.location.href = '/dashboard';
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <FiPlusCircle className="text-xl" />
                        Add Product
                    </button>
                </div>
            </div>
        </div>
    );
}