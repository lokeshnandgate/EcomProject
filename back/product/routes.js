const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('./controller');
const { verifyToken } = require('../middleware/auth');

// Public
router.get('/getp', getAllProducts);

// Protected
router.post('/createp', verifyToken, createProduct);
router.put('/updatep', verifyToken, updateProduct);

router.delete('/deletep/:id', verifyToken, deleteProduct);

module.exports = router;
