'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchUserProfile, fetchBusinessProfile, updateUserProfile, updateBusinessProfile } from '../../../redux/profile/action';
import { fetchProductsByUserId, deleteProductById, updateProductById } from '../../../redux/products/action';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiEdit, FiTrash2, FiHeart, FiSearch, FiX, FiCheck, 
  FiUpload, FiUser, FiHome, FiMail, FiPhone, FiMapPin, 
  FiGlobe, FiBriefcase, FiInfo, FiShoppingBag, FiPlus 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStore, FaBoxOpen, FaRupeeSign } from 'react-icons/fa';

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

const categoryIcons: Record<string, JSX.Element> = {
  onlineProductMarketplace: <FiShoppingBag className="text-purple-500" />,
  foodDelivery: <span className="text-red-500">🍔</span>,
  hotelBooking: <span className="text-blue-500">🏨</span>,
  salonSpaBooking: <span className="text-pink-500">💇‍♀️</span>,
  groceryDelivery: <span className="text-green-500">🛒</span>,
  eventTicketBooking: <span className="text-yellow-500">🎟️</span>,
  rentalMarketplace: <span className="text-indigo-500">🚗</span>,
  digitalProductsStore: <span className="text-teal-500">💾</span>,
  hyperlocalFarmDelivery: <span className="text-emerald-500">🌱</span>
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

const ProfilePage = () => {
  const { profileId } = useParams() as { profileId: string };
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { user, business, loading, error } = useAppSelector((state) => state.profile);
  const { list: products, loading: productsLoading, error: productsError } = useAppSelector(
    (state) => state.products
  );

  const [userType, setUserType] = useState<'user' | 'business' | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image: '',
    inStock: true,
  });
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'products'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    username: '',
    email: '',
    contactNumber: '',
    description: '',
    address: '',
    locationUrl: '',
    businessType: '',
    profilePic: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Check if current user is the profile owner
        const storedBusinessUser = sessionStorage.getItem('businessInfo');
        const storedUser = sessionStorage.getItem('userInfo');
        
        let currentUserType: 'user' | 'business' | null = null;
        let currentIsOwner = false;

        if (storedBusinessUser) {
          const parsed = JSON.parse(storedBusinessUser);
          const user = parsed?.user || parsed;
          if (user?._id) {
            currentUserType = 'business';
            currentIsOwner = user._id === profileId;
          }
        } else if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const user = parsed?.user || parsed;
          if (user?._id) {
            currentUserType = 'user';
            currentIsOwner = user._id === profileId;
          }
        }

        setUserType(currentUserType);
        setIsOwner(currentIsOwner);

        // Validate profileId is a valid MongoDB ObjectId before making the request
        if (profileId && /^[0-9a-fA-F]{24}$/.test(profileId)) {
          if (currentUserType === 'business') {
            await dispatch(fetchBusinessProfile(profileId));
          } else {
            await dispatch(fetchUserProfile(profileId));
          }
          await dispatch(fetchProductsByUserId(profileId));
        } else {
          console.warn('Invalid or missing profileId format:', profileId);
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    if (profileId) {
      console.log('Fetching profile for ID:', profileId);
      fetchProfileData();
    }
  }, [profileId, dispatch, router]);

  useEffect(() => {
    if (userType === 'business' && business) {
      setProfileFormData({
        username: business.username || '',
        email: business.email || '',
        contactNumber: business.contactNumber || '',
        description: business.description || '',
        address: business.address || '',
        locationUrl: business.locationUrl || '',
        businessType: business.businessType || '',
        profilePic: business.profilePic || ''
      });
    } else if (userType === 'user' && user) {
      setProfileFormData({
        username: user.username || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        description: user.description || '',
        address: user.address || '',
        locationUrl: user.locationUrl || '',
        businessType: '',
        profilePic: user.profilePic || ''
      });
    }
  }, [user, business, userType]);

  const handleDeleteProduct = useCallback((productId: string) => {
    setIsDeleting(productId);
    setTimeout(() => {
      dispatch(deleteProductById(productId));
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

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileFormData(prev => ({
          ...prev,
          profilePic: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleProfileSubmit = async () => {
    try {
      if (userType === 'business') {
        await dispatch(updateBusinessProfile({
          ...profileFormData,
          id: profileId
        }));
      } else {
        await dispatch(updateUserProfile({
          ...profileFormData,
          id: profileId
        }));
      }
      setIsEditingProfile(false);
      // Refresh profile data
      if (userType === 'business') {
        await dispatch(fetchBusinessProfile(profileId));
      } else {
        await dispatch(fetchUserProfile(profileId));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleProductSubmit = async () => {
    if (!editingProduct || !profileId) return;

    try {
      const updatedProduct = {
        ...formData,
        price: parseFloat(formData.price),
        inStock: Boolean(formData.inStock),
        addedBy: profileId,
        image: formData.image,
        productId: editingProduct._id,
      };

      await dispatch(updateProductById(updatedProduct));
      setShowModal(false);
      setEditingProduct(null);
      // Refresh products
      await dispatch(fetchProductsByUserId(profileId));
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  if (loading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-purple-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-6">{productsError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const profile = userType === 'business' ? business : user;
  const isBusinessProfile = userType === 'business';

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The requested profile could not be found.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-700">Dashboard</span>
            </motion.button>
          </Link>
          
          {isOwner && !isEditingProfile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg shadow-sm hover:shadow-md transition"
            >
              <FiEdit className="text-white" />
              Edit Profile
            </motion.button>
          )}
          {isEditingProfile && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingProfile(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <FiX className="text-white" />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleProfileSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <FiCheck className="text-white" />
                Save Changes
              </motion.button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="md:flex">
            {/* Profile Image Section */}
            <div className="md:w-1/3 bg-gradient-to-br from-purple-100 to-blue-100 p-8 flex flex-col items-center justify-center">
              <div className="relative">
                {isEditingProfile ? (
                  <div className="relative">
                    <Image
                      src={profileFormData.profilePic || '/default-avatar.png'}
                      width={160}
                      height={160}
                      className="rounded-full border-4 border-white shadow-lg"
                      alt="Profile Picture"
                    />
                    <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition">
                      <FiUpload className="text-lg" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <Image
                    src={profile.profilePic || '/default-avatar.png'}
                    width={160}
                    height={160}
                    className="rounded-full border-4 border-white shadow-lg"
                    alt="Profile Picture"
                  />
                )}
                {isBusinessProfile && (
                  <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full">
                    <FaStore className="text-lg" />
                  </div>
                )}
              </div>
              
              {isEditingProfile ? (
                <input
                  name="username"
                  value={profileFormData.username}
                  onChange={handleProfileFormChange}
                  className="text-2xl font-bold mt-4 text-gray-800 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none text-center"
                />
              ) : (
                <h2 className="text-2xl font-bold mt-4 text-gray-800">{profile.username}</h2>
              )}
              
              <div className="mt-4 w-full space-y-2">
                {isEditingProfile ? (
                  <>
                    <div className="flex items-center gap-2">
                      <FiMail className="text-purple-500" />
                      <input
                        name="email"
                        value={profileFormData.email}
                        onChange={handleProfileFormChange}
                        className="flex-1 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="text-purple-500" />
                      <input
                        name="contactNumber"
                        value={profileFormData.contactNumber}
                        onChange={handleProfileFormChange}
                        className="flex-1 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-purple-600 flex items-center gap-1">
                      <FiMail className="text-sm" /> {profile.email}
                    </p>
                    {profile.contactNumber && (
                      <p className="text-gray-600 flex items-center gap-1">
                        <FiPhone className="text-sm" /> {profile.contactNumber}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="md:w-2/3 p-8">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Profile Info
                </button>
                {isBusinessProfile && (
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {isOwner ? 'Your Products' : 'Products'}
                  </button>
                )}
              </div>

              {activeTab === 'profile' ? (
                <div className="space-y-6">
                  {/* Business Type */}
                  {isBusinessProfile && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Business Type</h3>
                      {isEditingProfile ? (
                        <input
                          name="businessType"
                          value={profileFormData.businessType}
                          onChange={handleProfileFormChange}
                          className="mt-1 text-lg font-medium text-gray-800 w-full bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                        />
                      ) : (
                        <p className="mt-1 text-lg font-medium text-gray-800 flex items-center gap-2">
                          <FiBriefcase className="text-purple-500" /> 
                          {profile.businessType || 'Not specified'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">About</h3>
                    {isEditingProfile ? (
                      <textarea
                        name="description"
                        value={profileFormData.description}
                        onChange={handleProfileFormChange}
                        className="mt-1 text-gray-700 w-full bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none min-h-[100px]"
                      />
                    ) : profile.description ? (
                      <p className="mt-1 text-gray-700 flex items-start gap-2">
                        <FiInfo className="text-purple-500 mt-1 flex-shrink-0" /> 
                        {profile.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-gray-400 italic">No description provided</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Address</h3>
                    {isEditingProfile ? (
                      <input
                        name="address"
                        value={profileFormData.address}
                        onChange={handleProfileFormChange}
                        className="mt-1 text-gray-700 w-full bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                      />
                    ) : profile.address ? (
                      <p className="mt-1 text-gray-700 flex items-start gap-2">
                        <FiMapPin className="text-purple-500 mt-1 flex-shrink-0" /> 
                        {profile.address}
                      </p>
                    ) : (
                      <p className="mt-1 text-gray-400 italic">No address provided</p>
                    )}
                  </div>

                  {/* Location URL */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Location</h3>
                    {isEditingProfile ? (
                      <input
                        name="locationUrl"
                        value={profileFormData.locationUrl}
                        onChange={handleProfileFormChange}
                        className="mt-1 text-blue-600 w-full bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                      />
                    ) : profile.locationUrl ? (
                      <a 
                        href={profile.locationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-1 text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <FiGlobe className="text-purple-500" /> 
                        {profile.locationUrl}
                      </a>
                    ) : (
                      <p className="mt-1 text-gray-400 italic">No location URL provided</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      {isOwner ? 'Your Products' : 'Products'}
                    </h3>
                    {isOwner && (
                      <Link href="/pages/addproduct">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-sm hover:shadow-md transition"
                        >
                          <FiPlus /> Add Product
                        </motion.button>
                      </Link>
                    )}
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-12">
                      <FaBoxOpen className="mx-auto text-4xl text-gray-300 mb-4" />
                      <h4 className="text-lg font-medium text-gray-500">No products yet</h4>
                      {isOwner && (
                        <Link href="/pages/addproduct">
                          <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                            Add Product
                          </button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((product) => (
                        <motion.div 
                          key={product._id} 
                          className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition ${isDeleting === product._id ? 'opacity-0 scale-90 transition-all duration-300' : ''}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="p-4">
                            {/* Product Image */}
                            <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-4">
                              {product.image ? (
                                <Image 
                                  src={product.image} 
                                  layout="fill"
                                  objectFit="cover"
                                  alt={product.title}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <FaBoxOpen className="text-4xl" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                {categoryIcons[product.category]}
                                <span>{categoryLabels[product.category]}</span>
                              </div>
                              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </div>
                            </div>

                            {/* Product Info */}
                            <div>
                              <h4 className="font-bold text-lg text-gray-800 line-clamp-1">{product.title}</h4>
                              <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">{product.description}</p>
                              <div className="mt-3 flex justify-between items-center">
                                <p className="font-bold text-purple-600 flex items-center">
                                  <FaRupeeSign className="mr-1" /> {product.price.toFixed(2)}
                                </p>
                                {isOwner && (
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleEditClick(product)}
                                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                      title="Edit"
                                    >
                                      <FiEdit size={16} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDeleteProduct(product._id)}
                                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                      title="Delete"
                                    >
                                      <FiTrash2 size={16} />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
       
        {/* Edit Product Modal */}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          <FaRupeeSign />
                        </span>
                        <input
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleFormChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      >
                        <option value="">Select a category</option>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                      <div className="flex items-center gap-4">
                        {formData.image && (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={formData.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <label className="flex-1">
                          <div className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors group">
                            <div className="flex flex-col items-center">
                              <FiUpload className="text-gray-400 mb-1 group-hover:text-purple-500 transition" />
                              <span className="text-sm text-gray-500 group-hover:text-purple-500 transition">
                                {formData.image ? 'Change image' : 'Upload image'}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProductImageUpload}
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
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                        In Stock
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleProductSubmit}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <FiCheck /> Save Changes
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;