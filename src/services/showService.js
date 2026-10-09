const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const showService = {
  criarShow: async (dadosShow) => {
    const { dataHora, setores, artistaId, localId } = dadosShow;

    if (!dataHora || !setores || !artistaId || !localId) {
      throw new Error('Todos os campos (dataHora, setores, artistaId, localId) são obrigatórios.');
    }

    const dataHoraParsed = new Date(dataHora);

    // Validação para evitar o erro "Invalid Date"
    if (isNaN(dataHoraParsed.getTime())) {
    throw new Error('Data e Hora inválidas. Use o formato ISO (ex: YYYY-MM-DDTHH:mm:ssZ ou YYYY-MM-DD HH:mm:ss).');
    }

    // Regra de Negócio: Impede shows no mesmo local e no mesmo horário
    const conflitoAgendamento = await prisma.show.findFirst({
      where: {
        localId: Number(localId),
        dataHora: dataHoraParsed
      }
    });

    if (conflitoAgendamento) {
      throw new Error('Já existe outro show cadastrado para este mesmo local e horário.');
    }

    return await prisma.show.create({
      data: {
        dataHora: dataHoraParsed,
        setores,
        artistaId: Number(artistaId),
        localId: Number(localId)
      },
      include: {
        artista: true,
        local: true
      }
    });
  },

  listarShows: async () => {
    return await prisma.show.findMany({
      include: {
        artista: true,
        local: true
      },
      orderBy: { dataHora: 'asc' }
    });
  },

  buscarPorId: async (id) => {
    const show = await prisma.show.findUnique({
      where: { id: Number(id) },
      include: {
        artista: true,
        local: true
      }
    });

    if (!show) throw new Error('Show não encontrado.');
    return show;
  },

  atualizarShow: async (id, dados) => {
    const showId = Number(id);
    const dataHoraParsed = dados.dataHora ? new Date(dados.dataHora) : undefined;

    const showAtual = await prisma.show.findUnique({ where: { id: showId } });
    if (!showAtual) throw new Error('Show não encontrado.');

    // Se estiver alterando o local ou o horário, verifica duplicidade
    const novoLocalId = dados.localId ? Number(dados.localId) : showAtual.localId;
    const novaDataHora = dataHoraParsed || showAtual.dataHora;

    const conflitoAgendamento = await prisma.show.findFirst({
      where: {
        id: { not: showId }, // Ignora o próprio show que está sendo editado
        localId: novoLocalId,
        dataHora: novaDataHora
      }
    });

    if (conflitoAgendamento) {
      throw new Error('Conflito de horário: Já existe um show agendado neste local e horário.');
    }

    return await prisma.show.update({
      where: { id: showId },
      data: {
        ...(dados.dataHora && { dataHora: dataHoraParsed }),
        ...(dados.setores && { setores: dados.setores }),
        ...(dados.artistaId && { artistaId: Number(dados.artistaId) }),
        ...(dados.localId && { localId: Number(dados.localId) })
      },
      include: {
        artista: true,
        local: true
      }
    });
  },

  deletarShow: async (id) => {
    const idNumber = Number(id);
    
    // Verifica se o show existe antes de tentar deletar
    const showExiste = await prisma.show.findUnique({
      where: { id: idNumber }
    });

    if (!showExiste) {
      throw new Error('Show não encontrado.');
    }

    return await prisma.show.delete({
      where: { id: idNumber }
    });
  }
};

module.exports = showService;