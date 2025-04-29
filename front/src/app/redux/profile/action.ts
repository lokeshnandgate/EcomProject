import axios from 'axios';
import { AppDispatch } from '../store/store';
import {
  fetchUserProfile,
  fetchBusinessProfile,
  updateUserProfile,
  updateBusinessProfile,
  clearProfile,
} from '../profile/slice';

// Fetch User Profile
const getUserProfile = (userId: string) => async (dispatch: AppDispatch) => {
  try {
    await dispatch(fetchUserProfile(userId));
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
  }
};

// Fetch Business Profile
 const getBusinessProfile = (businessId: string) => async (dispatch: AppDispatch) => {
  try {
    await dispatch(fetchBusinessProfile(businessId));
  } catch (error) {
    console.error('Failed to fetch business profile:', error);
  }
};

// Update User Profile
const updateUserProfileDetails = (profileData: Partial<any>) => async (dispatch: AppDispatch) => {
  try {
    await dispatch(updateUserProfile(profileData));
  } catch (error) {
    console.error('Failed to update user profile:', error);
  }
};

// Update Business Profile
const updateBusinessProfileDetails = (profileData: Partial<any>) => async (dispatch: AppDispatch) => {
  try {
    await dispatch(updateBusinessProfile(profileData));
  } catch (error) {
    console.error('Failed to update business profile:', error);
  }
};

// Clear Profile
 const clearProfileData = () => (dispatch: AppDispatch) => {
  dispatch(clearProfile());
};

export {
  getUserProfile,
  getBusinessProfile,
  updateUserProfileDetails,
  updateBusinessProfileDetails,
  clearProfileData,
};