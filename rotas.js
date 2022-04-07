const express = require('express');
const categorias = require('./controladores/categorias');
const transacoes = require('./controladores/transacoes');
const usuarios = require('./controladores/usuarios');

const rotas = express();

rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', usuarios.login);
rotas.get('/usuario', usuarios.detalharUsuario);

module.exports = rotas;

