const express = require('express')
require('./config/db')
const usuarioRouter = require('./routers/usuarioRout')
const produtoRouter = require('./routers/produtoRout')

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(usuarioRouter)
app.use(produtoRouter)


app.listen(port,()=>{
    console.log(`Servidor rodando na porta ${port}`)
})