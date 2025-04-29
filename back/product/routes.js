const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('./controller');
const { verifyToken } = require('./controller'); // Import the verifyToken middleware

// Apply verifyToken middleware to the routes that need protection
router.get('/getp', getAllProducts); // No protection needed for GET all products
router.post('/createp', verifyToken, createProduct);
router.put('/updatep', verifyToken, updateProduct);
router.delete('/deletep', verifyToken, deleteProduct);

module.exports = router;
