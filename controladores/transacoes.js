const conexao = require('../conexao');

const listarTransacoes = async (req, res) => {
    const { usuario } = req;

    const query = 'select * from transacoes where usuario_id=$1';
    const transacoes = await conexao.query(query, [usuario.id]);


}

const detalharTransacao = async (req, res) => {
    const { id } = req.params;
    const query = 'Select * from transacoes where id=$1';
    const transacao = await conexao.query(query, [id]);

    try {
        if (transacao.rowCount === 0) {
            return res.status(404).json({ "mensagem": "Transação não encontrada." });
        }

        return res.status(200).json(transacao.rows);

    } catch (error) {
        return res.status(400).json(error.message);
    }


    return res.status(200).json(transacao.rows);
}

const cadastrarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const { usuario } = req;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json({ "mensagem": "Todos os campos obrigatórios devem ser informados." });
    }

    if (tipo !== 'entrada' && tipo !== 'saída') {
        return res.status(400).json({ "mensagem": "Tipo de transação informado é inválido" })
    }

    try {
        const query = 'select * from categorias where id=$1';
        const categoria = await conexao.query(query, [categoria_id]);

        if (categoria.rowCount === 0) {
            return res.status(400).json({ "mensagem": "A categoria informada não existe" });
        }

    } catch (error) {
        return res.status(400).json(error.message);
    }

    try {
        const query = 'insert into transacoes (descricao, valor, data, categoria_id, tipo, usuario_id) values ($1,$2,$3,$4,$5,$6) returning *';
        const transacao = await conexao.query(query, [descricao, valor, data, categoria_id, tipo, usuario.id]);

        if (transacao.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Não foi possível criar a transação" });
        }

        const queryCategoria = 'select descricao from categorias where id=$1';
        const categoriaNome = await conexao.query(queryCategoria, [categoria_id]);


        return res.status(200).json({
            id: transacao.rows[0].id,
            tipo: transacao.rows[0].tipo,
            descricao: transacao.rows[0].descricao,
            valor: transacao.rows[0].valor,
            data: transacao.rows[0].data,
            usuario_id: usuario.id,
            categoria_id: transacao.rows[0].categoria_id,
            categoria_nome: categoriaNome.rows[0].descricao
        })
    } catch (error) {
        return res.status(400).json(error.message);
    }

}

const editarTransacao = async (req, res) => {
    const { id } = req.params;
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const { usuario } = req;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json({ "mensagem": "Todos os campos obrigatórios devem ser informados." });
    }

    if (tipo !== 'entrada' && tipo !== 'saída') {
        return res.status(400).json({ "mensagem": "Tipo de transação informado é inválido" })
    }

    try {
        const query = 'select * from categorias where id=$1';
        const categoria = await conexao.query(query, [categoria_id]);

        if (categoria.rowCount === 0) {
            return res.status(400).json({ "mensagem": "A categoria informada não existe" });
        }

    } catch (error) {
        return res.status(400).json(error.message);
    }

    try {
        const query = 'update transacoes set descricao=$1, valor=$2, data=$3, categoria_id=$4, tipo=$5 where id=$6';
        const transacao = await conexao.query(query, [descricao, valor, data, categoria_id, tipo, id]);

        const querySelect = 'select * from transacoes where id=$1';
        const consultaId = await conexao.query(querySelect, [id]);

        if (consultaId.rows[0].usuario_id !== usuario.id) {
            return res.status(400).json({ "mensagem": "Transação não corresponde ao usuário" })
        }

        if (transacao.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Não foi possível editar transação." });
        }
        return res.status(200).json({ "mensagem": "Edição foi realizada com sucesso!" });
    } catch (error) {
        return res.status(400).json(error.message);
    }

}

const removerTransacao = async (req, res) => {
    const { id } = req.params;
    const { usuario } = req;

    try {
        const query = 'select * from transacoes where id=$1';
        const transacao = await conexao.query(query, [id]);

        if (transacao.rowCount === 0) {
            return res.status(400).json({ "mensagem": "A transação informada não existe" });
        }

        const querySelect = 'select * from transacoes where id=$1';
        const consultaId = await conexao.query(querySelect, [id]);

        if (consultaId.rows[0].usuario_id !== usuario.id) {
            return res.status(400).json({ "mensagem": "Transação não corresponde ao usuário" })
        }

        const queryDelete = 'delete from transacoes where id=$1';
        const remocao = await conexao.query(queryDelete, [id]);

        return res.status(200).json();
    } catch (error) {

    }

}

const obterExtrato = async (req, res) => {
    const { usuario } = req;

    try {
        const query = 'select valor from transacoes where tipo =$1 and usuario_id=$2';
        const entrada = await conexao.query(query, ['entrada', usuario.id]);
        const saida = await conexao.query(query, ['saída', usuario.id]);

        let valorEntrada = 0;
        for (let valor of entrada.rows) {
            valorEntrada = valor.valor + valorEntrada;
        }

        let valorSaida = 0;
        for (let valor of saida.rows) {
            valorSaida = valor.valor + valorSaida;
        }

        return res.status(200).json({
            "entrada": valorEntrada,
            "saída": valorSaida
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    editarTransacao,
    removerTransacao,
    obterExtrato
}