const artistaService = require('../services/artistaService');

const artistaController = {
  criar: async (req, res) => {
    try {
      const artista = await artistaService.criar(req.body);
      res.status(201).json({ mensagem: 'Artista cadastrado!', artista });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  },

  listar: async (req, res) => {
    try {
      const artistas = await artistaService.listar();
      res.status(200).json(artistas);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const artista = await artistaService.buscarPorId(req.params.id);
      res.status(200).json(artista);
    } catch (erro) {
      res.status(404).json({ erro: erro.message });
    }
  },

  atualizar: async (req, res) => {
    try {
      const artista = await artistaService.atualizar(req.params.id, req.body);
      res.status(200).json({ mensagem: 'Artista atualizado com sucesso!', artista });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  },

  remover: async (req, res) => {
    try {
      await artistaService.remover(req.params.id);
      res.status(200).json({ mensagem: 'Artista removido com sucesso!' });
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
};

module.exports = artistaController;