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

rotas.get('/categoria', categorias.listarCategorias);

rotas.get('/transacao', transacoes.listarTransacoes);
rotas.get('/transacao/extrato', transacoes.obterExtrato);
rotas.get('/transacao/:id', transacoes.detalharTransacao);
rotas.post('/transacao', transacoes.cadastrarTransacao);
rotas.put('/transacao/:id', transacoes.editarTransacao);
rotas.delete('/transacao/:id', transacoes.removerTransacao);

module.exports = rotas;

