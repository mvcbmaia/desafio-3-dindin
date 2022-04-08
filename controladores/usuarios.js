const conexao = require('../conexao');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');
const { header } = require('express/lib/request');

const pwd = securePassword();

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ "mensagem": "Todos os campos são obrigatórios!" });
    }

    try {
        const query = 'select * from usuarios where email=$1';
        const usuario = await conexao.query(query, [email]);

        if (usuario.rowCount > 0) {
            return res.status(400).json({ "mensagem": "Já existe usuário cadastrado com o e-mail informado." });
        }

    } catch (error) {
        return res.status(400).json(error.message);
    }

    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const query = 'insert into usuarios (nome,email,senha) values ($1,$2,$3)';
        const usuario = await conexao.query(query, [nome, email, hash]);

        if (usuario.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Não foi possível cadastrar usuário" });
        }

        return res.status(200).json({ "mensagem": "Usuário Cadastrado com Sucesso!" })

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const login = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ "mensagem": "Todos os campos são obrigatórios!" });
    }

    try {
        const query = 'select * from usuarios where email=$1';
        const usuarios = await conexao.query(query, [email]);

        if (usuarios.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Usuário não foi localizado." });
        }

        const usuario = usuarios.rows[0]

        const result = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, "hex"));

        switch (result) {

            case securePassword.INVALID_UNRECOGNIZED_HASH:

            case securePassword.INVALID:
                return res.status(400).json({ "mensagem": "Email ou senha incorretos!" })

            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {

                    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
                    const query = 'update usuarios set senha = $1 where email = $2';
                    await conexao.query(query, [hash, email]);
                } catch {

                }
                break
        }
        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }, jwtSecret, {
            expiresIn: "10000h"
            //diminuir para uma hora no final
        });

        return res.send({
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            },
            token
        });
    } catch (error) {
        return res.status(400).json(error.message);
    }

}

const detalharUsuario = async (req, res) => {
    const { usuario } = req;

    try {
        const query = 'select * from usuarios where id=$1';
        const cliente = conexao.query(query, [usuario.id]);
        return res.status(200).json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        });
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const editarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { usuario } = req;

    if (!nome || !email || !senha) {
        return res.status(400).json({ "mensagem": "Todos os campos são obrigatórios!" });
    }
    try {
        const query = 'select * from usuarios where email=$1';
        const usuario = await conexao.query(query, [email]);

        if (usuario.rowCount > 0) {
            return res.status(400).json({ "mensagem": "Já existe usuário cadastrado com o e-mail informado." });
        }

    } catch (error) {
        return res.status(400).json(error.message);
    }
    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const query = 'update usuarios set nome = $1, email = $2, senha = $3 where id = $4';
        const cliente = await conexao.query(query, [nome, email, hash, usuario.id]);

        if (cliente.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Não foi possível autualizar o usuário" });
        }

        return res.status(200).json({ "mensagem": "Usuário atualizado com sucesso!" })

    } catch (error) {
        return res.status(400).json(error.message);
    }
}



module.exports = {
    cadastrarUsuario,
    login,
    detalharUsuario,
    editarUsuario
}