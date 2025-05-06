const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String,
  inStock: { type: Boolean, default: true },
  addedBy: {
    type: String,
    required: true
  },
  addedById: {
    type: mongoose.Schema.Types.ObjectId, // or String if you're storing it as a plain string
    required: true
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
