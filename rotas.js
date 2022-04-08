const express = require('express');
const categorias = require('./controladores/categorias');
const transacoes = require('./controladores/transacoes');
const usuarios = require('./controladores/usuarios');
const verificarLogin = require('./filtros/verificarLogin');

const rotas = express();

rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', usuarios.login);

rotas.use(verificarLogin);

rotas.get('/usuario', usuarios.detalharUsuario);
rotas.put('/usuario', usuarios.editarUsuario);

module.exports = rotas;

