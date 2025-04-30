const Product = require('./modal');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

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
    // Token verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header is missing or invalid' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET);

    const productData = req.body;

    const newProduct = new Product({
      title: productData.title,
      description: productData.description,
      price: parseFloat(productData.price),
      category: productData.category,
      image: productData.image, // If using file uploads, you can replace this with req.file.path
      inStock: productData.inStock === 'true' || productData.inStock === true,
    });

    const saved = await newProduct.save();
    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      data: saved,
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({
      error: 'Failed to create product',
      details: err.message,
    });
  }
};

// PUT update a product
exports.updateProduct = async (req, res) => {
  try {
    // Verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET);

    const { _id, ...updates } = req.body;

    if (!_id) {
      return res.status(400).json({ message: 'Product ID is required in body!' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(_id, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: updatedProduct,
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({
      error: 'Failed to update product',
      details: err.message,
    });
  }
};

// DELETE a product
exports.deleteProduct = async (req, res) => {
  verifyToken(req, res, async () => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });
};

// Export the token verification middleware
exports.verifyToken = verifyToken;
