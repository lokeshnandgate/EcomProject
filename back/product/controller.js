const Product = require('./modal');
const bcrypt = require('bcryptjs');
// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// POST a new product
exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product' });
  }
};
exports.updateProduct = async (req, res) => {
  try {
    const { productId, title, description, price, category, image, inStock } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required in body!'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found!'
      });
    }

    // Update fields if provided
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.image = image || product.image;
    product.inStock = inStock !== undefined ? inStock : product.inStock;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};
// // PUT update a product
// exports.updateProduct = async (req, res) => {
//   const { id,...rest } = req.body;
//   console.log('_id', id);
  
//   try {
 
//     const existingProduct = await Product.findOne({_id:id});
 
//     if (!existingProduct) {
//       return res.status(404).json({ error: 'Product not found' });
//     }
//     const updated = await Product.findOneAndUpdate({_id:id}, rest, { new: true });
 
//     if (!updated) return res.status(404).json({ error: 'Product not found' });
//     res.status(200).json(updated);
//   } catch (err) {
//     res.status(400).json({ error: 'Failed to update product' });
//   }
// };

// DELETE a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.body;
  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
