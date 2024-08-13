const express = require('express');
const router =  new express.Router();
const Produto = require('../models/produtos')
const auth = require('../middleware/authMidd')

router.post('/produto', auth, async (req, res) => {
    const produto = new Produto({
        ...req.body,
        owner: req.usuario._id
    })
    try {
        await produto.save()
        res.status(201).send(produto)
    } catch (e) {
        res.status(400).send(error)
    }
})

router.get('/produto', auth,async (req, res) => {
    const match={}
    const sort={}
    
    if (req.query.stock) {
        const stockValue = parseInt(req.query.stock, 10);
        if (!isNaN(stockValue)) {
            match.stock =  stockValue
        }
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.usuario.populate({
            path:'produtos',
            match,
            options:{
                sort
            }
        })
        if (req.usuario.produtos.length === 0) {
            return res.status(404).send({ message: 'Nenhum produto encontrado com a quantidade especificada em estoque.' });
        }
        res.send(req.usuario.produtos)
    } catch (error) {
        res.status(500).send({error: 'Erro ao buscar produtos'})
    }
})

router.get('/produto/:id', auth,async (req, res) => {
    const _id = req.params.id
    try {
        const produto = await Produto.findOne({_id, owner: req.usuario._id})
        if (!produto) {
            return res.status(404).send({error: 'Produto não encontrado'})
        }
        res.send(produto)
    } catch (error) {
        res.status(500).send({error: 'Produto não encontrado'})
    }
})

router.patch('/produto/:id', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'description','price','stock']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Atualizações inválidas' })
    }
    try {
        const produto = await Produto.findOne({_id: req.params.id, owner: req.usuario._id})
        if (!produto) {
            return res.status(404).send()
        }
        updates.forEach((update) => produto[update] = req.body[update])
        await produto.save()
        res.send(produto)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/produto/:id', auth ,async (req, res) => {
    try {
        const produto = await Produto.findOneAndDelete({_id: req.params.id, owner: req.usuario._id})
        if (!produto) {
            return res.status(404).send()
        }
        res.send(produto)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router