const express = require('express');
const localController = require('../controllers/localController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', localController.listar);
router.get('/:id', localController.buscarPorId);
router.post('/', authMiddleware, localController.criar);
router.put('/:id', authMiddleware, localController.atualizar);
router.delete('/:id', authMiddleware, localController.remover);

module.exports = router;