const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('./controller');

router.get('/getp', getAllProducts);
router.post('/createp', createProduct);
router.put('/updatep', updateProduct);
router.delete('/deletep', deleteProduct);

module.exports = router;