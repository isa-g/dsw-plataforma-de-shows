const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ingressoService = {
  comprar: async ({ usuarioId, showId, quantidade, tipo }) => {
    if (!showId || !quantidade || !tipo) {
      throw new Error('Todos os campos (showId, quantidade, tipo) são obrigatórios.');
    }

    // Normaliza o tipo de ingresso para corresponder ao Enum do Prisma (ex: "cadeira superior" -> "CADEIRA_SUPERIOR")
    const tipoFormatado = tipo.trim().toUpperCase().replace(/\s+/g, '_');

    // Lista de valores válidos no Enum do Prisma
    const tiposValidos = ['PISTA', 'VIP', 'CAMAROTE', 'CADEIRA_SUPERIOR', 'CADEIRA_INFERIOR', 'ARQUIBANCADA'];

    if (!tiposValidos.includes(tipoFormatado)) {
      throw new Error(`Tipo de ingresso inválido. Escolha um dos seguintes: ${tiposValidos.join(', ')}`);
    }

    // Verifica se o show existe
    const showExiste = await prisma.show.findUnique({
      where: { id: Number(showId) }
    });

    if (!showExiste) {
      throw new Error('Show não encontrado.');
    }

    return await prisma.ingresso.create({
      data: {
        usuarioId: Number(usuarioId),
        showId: Number(showId),
        quantidade: Number(quantidade),
        tipo: tipoFormatado
      },
      include: {
        show: {
          include: { artista: true, local: true }
        }
      }
    });
  },

  listarMeusIngressos: async (usuarioId) => {
    return await prisma.ingresso.findMany({
      where: { usuarioId: Number(usuarioId) },
      include: {
        show: {
          include: { artista: true, local: true }
        }
      }
    });
  }
};

module.exports = ingressoService;