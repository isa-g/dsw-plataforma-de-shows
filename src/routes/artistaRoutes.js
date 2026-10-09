const express = require('express');
const artistaController = require('../controllers/artistaController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', artistaController.listar);
router.get('/:id', artistaController.buscarPorId);
router.post('/', authMiddleware, artistaController.criar);
router.put('/:id', authMiddleware, artistaController.atualizar);
router.delete('/:id', authMiddleware, artistaController.remover);

module.exports = router;