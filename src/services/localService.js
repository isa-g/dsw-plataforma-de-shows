const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const localService = {
  criar: async ({ nome, cidade, capacidade }) => {
    if (!nome || !cidade) {
      throw new Error('O nome e a cidade do local são obrigatórios.');
    }

    return await prisma.local.create({
      data: {
        nome,
        cidade,
        capacidade: capacidade ? Number(capacidade) : null
      }
    });
  },

  listar: async () => {
    return await prisma.local.findMany();
  },

  buscarPorId: async (id) => {
    const local = await prisma.local.findUnique({
      where: { id: Number(id) }
    });
    if (!local) throw new Error('Local não encontrado.');
    return local;
  },

  atualizar: async (id, { nome, cidade, capacidade }) => {
    const idNumber = Number(id);
    const localExiste = await prisma.local.findUnique({ where: { id: idNumber } });
    if (!localExiste) throw new Error('Local não encontrado.');

    return await prisma.local.update({
      where: { id: idNumber },
      data: {
        ...(nome && { nome }),
        ...(cidade && { cidade }),
        ...(capacidade !== undefined && { capacidade: capacidade ? Number(capacidade) : null })
      }
    });
  },

  remover: async (id) => {
    const idNumber = Number(id);
    const localExiste = await prisma.local.findUnique({ where: { id: idNumber } });
    if (!localExiste) throw new Error('Local não encontrado.');

    return await prisma.local.delete({
      where: { id: idNumber }
    });
  }
};

module.exports = localService;