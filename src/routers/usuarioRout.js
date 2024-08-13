const express = require('express');
const router =  new express.Router();
const Usuario = require('../models/usuario')
const auth = require('../middleware/authMidd')

router.post('/usuario', async(req,res)=>{
    const usuario = new Usuario(req.body)

    try{
        await usuario.save()
        const token = await usuario.generateAuthToken()
        res.status(201).send({usuario, token})
    }catch(error){
        res.status(400).send({error: 'Email já em uso'})
    }
})

router.post('/usuario/login', async(req,res)=>{
    try{
        const usuario = await Usuario.findByCredentials(req.body.email, req.body.password)
        const token = await usuario.generateAuthToken()
        res.send({usuario,token})
    }catch(error){
        res.status(400).send({error: 'Email ou senha invalidos'})
    }
})

router.post('/usuario/logout', auth, async(req,res)=>{
    try{
        req.usuario.tokens = req.usuario.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.usuario.save()

        res.send('Logout realizado')
    }catch(error){
        res.status(500).send()
    }
})

router.get('/usuario/me', auth, async (req, res) => {
    res.send(req.usuario)
})

router.patch('/usuario/me', auth ,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Atualizações inválidas' })
    }
    try {
        updates.forEach((update)=> req.usuario[update] = req.body[update])
        await req.usuario.save()
        res.send(req.usuario)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/usuario/me', auth ,async (req, res) => {
    try {
        await req.usuario.deleteOne()
        res.send(req.usuario)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router