const localService = require('../services/localService');

const localController = {
  criar: async (req, res) => {
    try {
      const local = await localService.criar(req.body);
      res.status(201).json({ mensagem: 'Local cadastrado com sucesso!', local });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  },

  listar: async (req, res) => {
    try {
      const locais = await localService.listar();
      res.status(200).json(locais);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const local = await localService.buscarPorId(req.params.id);
      res.status(200).json(local);
    } catch (erro) {
      res.status(404).json({ erro: erro.message });
    }
  },

  atualizar: async (req, res) => {
    try {
      const local = await localService.atualizar(req.params.id, req.body);
      res.status(200).json({ mensagem: 'Local atualizado com sucesso!', local });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  },

  remover: async (req, res) => {
    try {
      await localService.remover(req.params.id);
      res.status(200).json({ mensagem: 'Local removido com sucesso!' });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
};

module.exports = localController;