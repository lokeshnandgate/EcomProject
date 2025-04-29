"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
const Navbar: React.FC = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // const handleBack = () => {
  //   router.back();
  // };

  const handleAddToCart = () => {
    router.push('/components/addtocart');
  };

  const handleLogout = () => {
    alert('Do you want to logout?');

    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('businessInfo');
    router.push('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
    <nav className="navbar">
      {/* <button onClick={handleBack} className="back-button">
        ← Back
      </button> */}
      <h1 className="navbar-title">UrbanCart</h1>
      <div className="profile">
        <button onClick={() => router.push('/components/profile')} className="profile-icon">
          <img src="/path-to-profile-icon.png" alt="Profile" />
        </button>
      </div>
      <div className="dropdown">
        <button onClick={toggleDropdown} className="dropdown-button">
          ▼
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
      <style jsx>{`
        .navbar {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #ddd;
        }
        .back-button {
          margin-right: 20px;
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
        }
        .navbar-title {
          font-size: 18px;
          font-weight: bold;
          flex-grow: 1;
        }
        .dropdown {
          position: relative;
        }
        .dropdown-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        .dropdown-button:hover {
          background-color: #0056b3;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        .dropdown-item {
          display: block;
          width: 100%;
          padding: 10px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
        }
        .dropdown-item:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </nav>
    </>
  );
};

export default Navbar;