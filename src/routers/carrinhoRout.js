const express = require('express');
const Carrinho = require('../models/carrinho')
const auth = require('../middleware/authMidd')
const router = new express.Router();
const Produto = require('../models/produtos')

// GET /cartinho: Get user's cart
router.get('/carrinho', auth, async (req, res) => {
    try {
      const carrinho = await Carrinho.findOne({ usuario: req.usuario._id }).populate('items.produto');
  
      if (!carrinho) {
        return res.status(404).send({ message: 'Carrinho não encontrado' });
      }
  
      // Verifica se o carrinho tem itens
      if (carrinho.items.length === 0) {
        return res.status(200).send({ message: 'Seu carrinho está vazio', carrinho });
      }
  
      res.status(200).send(carrinho);
    } catch (error) {
      res.status(500).send({ error: 'Ocorreu um erro ao recuperar o carrinho', details: error });
    }
  });

router.post('/carrinho', auth, async (req, res) => {
    const { produto: produtoId, quantidade } = req.body;
    try {
      const produto = await Produto.findById(produtoId)
      if (!produto) {
        return res.status(404).send({ error: 'Produto não encontrado' })
      }
      
      // Verifica se a quantidade solicitada está disponível em stock
      if (quantidade > produto.stock) {
        return res.status(400).send({ error: `A quantidade solicitada (${quantidade}) excede o estoque disponível (${produto.stock})`})
      }
  
      let carrinho = await Carrinho.findOne({ usuario: req.usuario._id })
      if (!carrinho) {
        carrinho = new Carrinho({ usuario: req.usuario._id, items: [] })
      }
      const itemIndex = carrinho.items.findIndex(item => item.produto.equals(produto._id))
      if (itemIndex > -1) {
        const quantidadeTotal = carrinho.items[itemIndex].quantidade + quantidade
        if (quantidadeTotal > produto.stock) {
          return res.status(400).send({ error: `A quantidade total no carrinho (${quantidadeTotal}) excede o estoque disponível (${produto.stock}).` })
        }
        carrinho.items[itemIndex].quantidade = quantidadeTotal
      } else {
        carrinho.items.push({ produto: produto._id, quantidade })
      }
  
      // Atualiza o stock do produto
      produto.stock -= quantidade
      await produto.save()
  
      await carrinho.save()
      res.status(201).send(carrinho)
    } catch (error) {
      res.status(500).send(error)
      console.log({error})
    }
  })

// PUT /cart/:item_id: Update item quantity in cart
router.patch('/carrinho/:item_id', auth, async (req, res) => {
    const { quantidade } = req.body;
  
    try {
      const carrinho = await Carrinho.findOne({ user: req.usuario._id });
      
      if (!carrinho) {
        return res.status(404).send({ error: 'Carrinho não encontrado' });
      }
  
      const item = carrinho.items.id(req.params.item_id);
  
      if (!item) {
        return res.status(404).send({ error: 'Item não encontrado no carrinho' });
      }
  
      const produto = await Produto.findById(item.produto);
  
      if (!produto) {
        return res.status(404).send({ error: 'Produto não encontrado' });
      }
  
      // Verifica se a quantidade atualizada está disponível em stock
      if (quantidade > produto.stock + item.quantidade) {
        return res.status(400).send({ error: `A quantidade solicitada (${quantidade}) excede o estoque disponível (${produto.stock + item.quantidade}).` });
      }
  
      // Atualiza o stock
      produto.stock += item.quantidade - quantidade;  // Restaura o stock da quantidade anterior e subtrai a nova
      await produto.save();
  
      // Atualiza a quantidade do item no carrinho
      item.quantidade = quantidade;
      await carrinho.save();
  
      res.status(200).send(carrinho);
    } catch (error) {
      res.status(500).send(error);
    }
  });

// DELETE /cart/:item_id: Remove item from cart
router.delete('/carrinho/:item_id', auth, async (req, res) => {
    try {
      const carrinho = await Carrinho.findOne({ usuario: req.usuario._id });
      if (!carrinho) {
        return res.status(404).send({ error: 'Carrinho não encontrado' });
      }
      const item = carrinho.items.id(req.params.item_id);
      if (!item) {
        return res.status(404).send({ error: 'Item não encontrado no carrinho' });
      }
  
      const produto = await Produto.findById(item.produto);
      if (!produto) {
        return res.status(404).send({ error: 'Produto não encontrado' });
      }
  
      // Restaura o stock ao remover o item do carrinho
      produto.stock += item.quantidade;
      await produto.save();
  
      item.remove();
      await carrinho.save();
      res.status(200).send(carrinho);
    } catch (error) {
      res.status(500).send(error);
    }
  })

module.exports = router;
