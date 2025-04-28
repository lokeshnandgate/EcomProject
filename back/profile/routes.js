const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../profile/controller');
const { updateUserProfile } = require('../profile/controller'); // Assuming you have a function to update user profile
const { getBusinessUserProfile } = require('../profile/controller'); // Assuming you have a function to get business profile
const { updateBusinessProfile } = require('../profile/controller'); // Assuming you have a function to update business profile

router.get('/user/profile', getUserProfile);
router.put('/user/updateprofile', updateUserProfile); // Assuming you have a function to update user profile

router.get('/business/profile', getBusinessUserProfile);
router.put('/business/updateprofile', updateBusinessProfile); // Assuming you have a function to update business profile

module.exports = router;
