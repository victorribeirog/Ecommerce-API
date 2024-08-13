const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Usuario'
  },
}, {
  timestamps: true
})

const Produto = mongoose.model('Produto', produtoSchema)
module.exports = Produto