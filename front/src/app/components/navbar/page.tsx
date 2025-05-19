'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAddToCart = () => {
    router.push('/pages/addtocart');
  };

  const handleChat = () => {
    router.push('/pages/chat');
  };

  const gotoprofile = () => {
    // Ensure you're in a browser environment before accessing sessionStorage
    const userInfo = typeof window !== 'undefined' ? sessionStorage.getItem('userInfo') : null;
    const businessInfo = typeof window !== 'undefined' ? sessionStorage.getItem('businessInfo') : null;

    // Determine the ID to navigate to the profile page
    const id = userInfo ? JSON.parse(userInfo)._id : businessInfo ? JSON.parse(businessInfo)._id : '';
    if (id) {
      router.push(`/pages/profile/${id}`);
    } else {
      console.warn('No user or business info found to navigate to profile.');
      // Optionally redirect to login or a default page if no info
      // router.push('/pages/login');
    }
  };

  const fetchCurrentUser = () => {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const userInfo = sessionStorage.getItem('userInfo');
      const businessInfo = sessionStorage.getItem('businessInfo');

      if (userInfo) {
        return JSON.parse(userInfo);
      } else if (businessInfo) {
        return JSON.parse(businessInfo);
      }
    }
    return null;
  };

  const handleLogout = async () => {
    const confirmLogout = confirm('Do you want to logout?');
    if (!confirmLogout) return;

    const token = sessionStorage.getItem('token');
    // Ensure API_URL is correctly trimmed and defaults if not set
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3001';

    if (!API_URL) {
      console.error('API base URL is not defined. Please check your environment variables.');
      alert('Logout failed: API configuration error.');
      return;
    }

    if (token) {
      try {
        const response = await axios.post(`${API_URL}/api/logout`, {}, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        });

        if (response.status === 200) {
          console.log('Logout successful (backend confirmed)');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Specific error handling for 404 if the endpoint is truly missing
          if (error.response?.status === 404) {
            console.error('Logout endpoint not found (404). Ensure `/api/logout` is implemented and API URL is correct.');
            alert('Logout failed: Server endpoint not found. Please contact support.');
          } else {
            // Log other HTTP errors
            console.error(`Logout error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
            alert(`Logout failed: ${error.response?.data?.message || 'Server error.'}`);
          }
        } else {
          // Log unexpected errors
          console.error('Unexpected error during logout:', error);
          alert('Logout failed due to an unexpected error. Please try again.');
        }
      }
    } else {
      console.warn('No token found in session storage. Proceeding with client-side logout.');
    }

    // Always clear local storage and redirect, regardless of backend response
    // This provides a better user experience even if the backend is down or errors.
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('businessInfo');
    sessionStorage.removeItem('token');
    router.push('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

    try {
      const response = await axios.get(`${API_URL}/api/products?search=${query}`);
      setSearchResults(response.data || []);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn('No products found for the search query.');
      } else {
        console.error('Search error:', error);
      }
      setSearchResults([]);
    }
  };

  return (
    <>
      <nav className="navbar">
        <h1 className="navbar-title">UrbanCart</h1>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="search-input"
          />

          <div className="icons-container">
            <button onClick={() => router.push('/pages/chat')} className="icon-button">
              <img src="/chat.svg" alt="Chat" />
            </button>

            <button onClick={gotoprofile} className="icon-button">
              <img
              src={fetchCurrentUser()?.profilePic || '/default-profile.png'}
              alt="Profile"
              />
            </button>

            <div className="dropdown">
              <button onClick={toggleDropdown} className="dropdown-button" style={{ backgroundColor: 'transparent', color: 'inherit', border: 'none', padding: 0, fontSize: '24px', cursor: 'pointer' }}>
                ⋮
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={handleAddToCart} className="dropdown-item">
                    Add to Cart
                  </button>
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Results Display */}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((product) => (
            <div key={product._id} className="search-result-item">
              <img src={product.image} alt={product.title} className="result-image" />
              <div>
                <h4>{product.title}</h4>
                <p>₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .navbar {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #ddd;
          gap: 15px;
        }
        .navbar-title {
          font-size: 18px;
          font-weight: bold;
        }
        .search-input {
          flex-grow: 1;
          max-width: 300px;
          padding: 6px 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
        }
        .icons-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .icon-button {
          background: none; /* Remove default button background */
          border: none; /* Remove default button border */
          padding: 0; /* Remove default button padding */
          cursor: pointer;
        }
        .icon-button img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #ccc;
          padding: 4px;
          background: white;
          object-fit: cover; /* Ensure image covers the area nicely */
        }
        .dropdown {
          position: relative;
        }
        .dropdown-button {
          background-color: transparent; /* Changed to transparent for the '⋮' button */
          color: inherit;
          border: none;
          padding: 0;
          font-size: 24px;
          cursor: pointer;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          z-index: 1000;
          min-width: 120px; /* Give some minimum width */
        }
        .dropdown-item {
          padding: 10px;
          cursor: pointer;
          background: none;
          border: none;
          text-align: left;
          width: 100%;
          display: block; /* Ensure it takes full width of the dropdown */
        }
        .dropdown-item:hover {
          background-color: #f0f0f0;
        }

        .search-results {
          background-color: #fffce8;
          padding: 10px 20px;
          border-top: 1px solid #ddd;
          max-height: 300px;
          overflow-y: auto;
          position: absolute; /* Position below navbar if needed, or adjust flow */
          width: 100%;
          box-sizing: border-box; /* Include padding/border in element's total width/height */
          z-index: 999; /* Below dropdown menu, but above page content */
        }

        .search-result-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          gap: 12px;
        }
        .search-result-item:last-child {
          border-bottom: none; /* No border for the last item */
        }

        .result-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
      `}</style>
    </>
  );
};

export default Navbar;