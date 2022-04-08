const conexao = require('../conexao');


const listarCategorias = async (req, res) => {
    const query = 'select * from categorias';
    const categorias = await conexao.query(query);

    res.status(200).json(categorias.rows);
}

module.exports = {
    listarCategorias,
}