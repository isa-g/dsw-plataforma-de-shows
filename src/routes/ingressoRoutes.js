const express = require('express');
const ingressoController = require('../controllers/ingressoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/comprar', authMiddleware, ingressoController.comprar);
router.get('/meus-ingressos', authMiddleware, ingressoController.meusIngressos);

module.exports = router;