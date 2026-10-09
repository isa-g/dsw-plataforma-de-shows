// src/controllers/ingressoController.js

const ingressoService = require('../services/ingressoService');

const ingressoController = {
  comprar: async (req, res) => {
    try {
      // 1. Extração segura do ID do usuário logado (suporta req.usuarioId e req.usuario.id)
      const usuarioId = req.usuarioId || (req.usuario && req.usuario.id);

      if (!usuarioId) {
        return res.status(401).json({ 
          erro: 'Usuário não autenticado. Token ausente ou inválido.' 
        });
      }

      // 2. Extração dos campos enviados no corpo da requisição
      const { showId, quantidade, tipo } = req.body;

      // 3. Validações preventivas de entrada
      if (!showId || isNaN(Number(showId))) {
        return res.status(400).json({ 
          erro: 'O campo "showId" é obrigatório e deve ser um número válido.' 
        });
      }

      if (!quantidade || isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
        return res.status(400).json({ 
          erro: 'O campo "quantidade" é obrigatório e deve ser um número maior que zero.' 
        });
      }

      if (!tipo || typeof tipo !== 'string' || !tipo.trim()) {
        return res.status(400).json({ 
          erro: 'O campo "tipo" é obrigatório (ex: PISTA, VIP, CADEIRA_SUPERIOR, etc.).' 
        });
      }

      // 4. Execução do serviço de compra
      const ingresso = await ingressoService.comprar({
        usuarioId: Number(usuarioId),
        showId: Number(showId),
        quantidade: Number(quantidade),
        tipo: tipo.trim()
      });

      return res.status(201).json({ 
        mensagem: 'Ingresso comprado com sucesso!', 
        ingresso 
      });

    } catch (erro) {
      // Trata erros de negócio capturados do serviço (ex: show não existe, tipo inválido)
      return res.status(400).json({ erro: erro.message });
    }
  },

  meusIngressos: async (req, res) => {
    try {
      const usuarioId = req.usuarioId || (req.usuario && req.usuario.id);

      if (!usuarioId) {
        return res.status(401).json({ 
          erro: 'Usuário não autenticado. Token ausente ou inválido.' 
        });
      }

      const ingressos = await ingressoService.listarMeusIngressos(Number(usuarioId));
      return res.status(200).json(ingressos);

    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  }
};

module.exports = ingressoController;