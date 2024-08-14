const mongoose = require('mongoose');

const carrinhoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  items: [{
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produto',
      required: true
    },
    quantidade: {
      type: Number,
      required: true,
      min: 1
    }
  }]
}, {
  timestamps: true
});

carrinhoSchema.methods.toJSON = function(){
    const carrinho = this
    const carrinhoObject = carrinho.toObject()

    carrinhoObject.items = carrinhoObject.items.map(item=>{
        return{
            quantidade: item.quantidade,
            produto:{
                name:item.produto.name,
                description: item.produto.description,
                price: item.produto.price
            }
        }
    })
    return{
        item: carrinhoObject.items
    }
}


const Carrinho = mongoose.model('carrinho', carrinhoSchema);
module.exports = Carrinho;
