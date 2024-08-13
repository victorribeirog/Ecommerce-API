const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Produto = require('./produtos')

const usuarioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
}, {
    timestamps: true
})

usuarioSchema.virtual('produtos', {
    ref: 'Produto',
    localField: '_id',
    foreignField: 'owner'
})

usuarioSchema.methods.toJSON = function () {
    const usuario = this
    const usuarioObject = usuario.toObject()

    delete usuarioObject.password
    delete usuarioObject.tokens

    return usuarioObject
}

usuarioSchema.methods.generateAuthToken = async function () {
    const usuario = this
    const token = jwt.sign({ _id: usuario._id }, 'ecommerce')

    usuario.tokens = usuario.tokens.concat({ token })
    await usuario.save()

    return token
}

usuarioSchema.statics.findByCredentials = async (email, password) => {
    const usuario = await Usuario.findOne({ email })

    if (!usuario) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, usuario.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return usuario
}

usuarioSchema.pre('save', async function (next) {
    const usuario = this

    if (usuario.isModified('password')) {
        usuario.password = await bcrypt.hash(usuario.password, 8)
    }

    next()
})

usuarioSchema.pre('deleteOne', {document:true}, async function(next){
    const usuario = this
    await Produto.deleteMany({owner: usuario._id})
    next()
})

const Usuario = mongoose.model('Usuario', usuarioSchema)
module.exports = Usuario