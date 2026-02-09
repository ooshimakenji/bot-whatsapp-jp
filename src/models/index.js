const cliente = require('./cliente');
const servico = require('./servico');
const orcamento = require('./orcamento');
const historico = require('./historico');
const promocao = require('./promocao');

module.exports = {
  ...cliente,
  ...servico,
  ...orcamento,
  ...historico,
  ...promocao,
};
