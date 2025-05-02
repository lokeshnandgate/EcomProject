const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyToken
} = require('./controller');

// Public routes
router.get('/getp', getAllProducts);

// Protected routes
router.post('/createp', verifyToken, createProduct);
router.put('/updatep', verifyToken, updateProduct);
router.delete('/deletep', verifyToken, deleteProduct);

module.exports = router;