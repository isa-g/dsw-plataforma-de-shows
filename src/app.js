const express = require('express');
const cors = require('cors');

// Importação das rotas
const showRoutes = require('./routes/showRoutes');
const authRoutes = require('./routes/authRoutes');
const artistaRoutes = require('./routes/artistaRoutes');
const localRoutes = require('./routes/localRoutes');
const ingressoRoutes = require('./routes/ingressoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Registrando as rotas
app.use('/api/auth', authRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/artistas', artistaRoutes);
app.use('/api/locais', localRoutes);
app.use('/api/ingressos', ingressoRoutes);

// Middleware centralizado de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Ocorreu um erro interno na plataforma.' });
});

module.exports = app;