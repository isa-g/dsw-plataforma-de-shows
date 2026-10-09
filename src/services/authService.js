const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const authService = {
  cadastrar: async ({ nome, username, email, senha, role }) => {
    if (!nome || !username || !email || !senha) {
      throw new Error('Todos os campos (nome, username, email, senha) são obrigatórios.');
    }

    // Verifica se já existe utilizador com o mesmo e-mail ou username
    const usuarioExiste = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (usuarioExiste) {
      throw new Error('E-mail ou username já cadastrado.');
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Valida se o role enviado é válido (ADMIN ou CLIENTE). Se não enviado, define CLIENTE.
    const roleValido = (role === 'ADMIN' || role === 'CLIENTE') ? role : 'CLIENTE';

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        username,
        email,
        senha: senhaHash,
        role: roleValido
      },
      select: {
        id: true,
        nome: true,
        username: true,
        email: true,
        senha: true,
        role: true,
        criadoEm: true
      }
    });

    return usuario;
  },

  login: async ({ login, senha }) => {
    // Busca por e-mail ou username
    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [{ email: login }, { username: login }]
      }
    });

    if (!usuario) {
      throw new Error('Credenciais inválidas.');
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw new Error('Credenciais inválidas.');
    }

    // Gera o token JWT incluindo o ID e o Role do utilizador
    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET || 'deusavenus',
      { expiresIn: '1d' }
    );

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        username: usuario.username,
        email: usuario.email,
        senha: usuario.senhaHash,
        role: usuario.role
      },
      token
    };
  }
};

module.exports = authService;