const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../profile/controller');
const { updateUserProfile } = require('../profile/controller'); 
const { getBusinessUserProfile } = require('../profile/controller'); 
const { updateBusinessProfile } = require('../profile/controller'); 

router.post('/user/profile', getUserProfile);
router.put('/user/updateprofile', updateUserProfile); 

router.post('/business/profile', getBusinessUserProfile);
router.put('/business/updateprofile', updateBusinessProfile); 

module.exports = router;