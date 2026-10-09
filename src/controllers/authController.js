const authService = require('../services/authService');

const authController = {
  cadastrar: async (req, res) => {
    try {
      const { nome, username, email, senha, role } = req.body;
      const usuario = await authService.cadastrar({ nome, username, email, senha, role });
      res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  },

  login: async (req, res) => {
    try {
      const { login, senha } = req.body;
      const resultado = await authService.login({ login, senha });
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
};

module.exports = authController;