const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const artistaService = {
  criar: async ({ nome }) => {
    if (!nome) throw new Error('O nome do artista é obrigatório.');
    return await prisma.artista.create({ data: { nome } });
  },

  listar: async () => {
    return await prisma.artista.findMany();
  },

  buscarPorId: async (id) => {
    const artista = await prisma.artista.findUnique({
      where: { id: Number(id) }
    });
    if (!artista) throw new Error('Artista não encontrado.');
    return artista;
  },

  atualizar: async (id, { nome }) => {
    const idNumber = Number(id);
    const artistaExiste = await prisma.artista.findUnique({ where: { id: idNumber } });
    if (!artistaExiste) throw new Error('Artista não encontrado.');

    if (!nome) throw new Error('O nome do artista é obrigatório.');

    return await prisma.artista.update({
      where: { id: idNumber },
      data: { nome }
    });
  },

  remover: async (id) => {
    const idNumber = Number(id);
    const artistaExiste = await prisma.artista.findUnique({ where: { id: idNumber } });
    if (!artistaExiste) throw new Error('Artista não encontrado.');

    return await prisma.artista.delete({
      where: { id: idNumber }
    });
  }
};

module.exports = artistaService;