const showService = require('../services/showService');

const showController = {
  criar: async (req, res, next) => {
    try {
      const novoShow = await showService.criarShow(req.body);
      res.status(201).json({ mensagem: 'Show cadastrado com sucesso!', show: novoShow });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  },

  listar: async (req, res, next) => {
    try {
      const shows = await showService.listarShows();
      res.status(200).json(shows);
    } catch (erro) {
      next(erro);
    }
  },

  buscarPorId: async (req, res, next) => {
    try {
      const show = await showService.buscarPorId(req.params.id);
      res.status(200).json(show);
    } catch (erro) {
      res.status(404).json({ erro: erro.message });
    }
  },

  atualizar: async (req, res, next) => {
    try {
      const showAtualizado = await showService.atualizarShow(req.params.id, req.body);
      res.status(200).json({ mensagem: 'Show atualizado com sucesso!', show: showAtualizado });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  },

  deletar: async (req, res, next) => {
    try {
      await showService.deletarShow(req.params.id);
      res.status(200).json({ mensagem: 'Show removido com sucesso!' });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
};

module.exports = showController;