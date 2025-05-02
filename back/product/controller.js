const Product = require('./modal');
const jwt = require('jsonwebtoken');

// JWT Verification Middleware
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ message: 'Authorization header is missing' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ 
      message: 'Authorization header format is incorrect. Use "Bearer <token>"' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        message: 'Token expired, please log in again' 
      });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// GET all products (public endpoint)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// POST a new product (protected)
exports.createProduct = async (req, res) => {
  try {
    // Verify user role if needed
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product' });
  }
};

// PUT update a product (protected)
exports.updateProduct = async (req, res) => {
  try {
    // Verify user role if needed
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

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

// DELETE a product (protected)
exports.deleteProduct = async (req, res) => {
  try {
    // Verify user role if needed
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id } = req.body;
    const deleted = await Product.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};