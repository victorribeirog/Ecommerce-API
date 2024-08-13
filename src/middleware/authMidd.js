const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuario')

const auth = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token, 'ecommerce')
        const usuario = await Usuario.findOne({_id: decode._id, 'tokens.token': token})
        if(!usuario){
            throw new Error()
        }
        req.token = token
        req.usuario = usuario
        next()
    }catch(error){
        res.status(401).send({error: 'Este usuário não está logado'})
    }
}

module.exports = auth