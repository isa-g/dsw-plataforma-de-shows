const express = require('express');
const showController = require('../controllers/showController');
const authMiddleware = require('../middlewares/authMiddleware');
const autorizar = require('../middlewares/autorizar');

const router = express.Router();

// CLIENTE e ADMIN podem consultar shows
router.get('/', showController.listar);
router.get('/:id', showController.buscarPorId);

// APENAS ADMIN pode criar, editar ou excluir
router.post('/', authMiddleware, autorizar(['ADMIN']), showController.criar);
router.put('/:id', authMiddleware, autorizar(['ADMIN']), showController.atualizar);
router.delete('/:id', authMiddleware, autorizar(['ADMIN']), showController.deletar);

module.exports = router;