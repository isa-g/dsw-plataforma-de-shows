const readline = require('readline');

const API_URL = 'http://localhost:3000/api';
let tokenGlobal = '';
let usuarioLogado = null; // Armazena os dados do utilizador logado ({ id, nome, role })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pergunta = (texto) => new Promise((resolve) => rl.question(texto, resolve));

// Função auxiliar para requisições HTTP
async function fazerRequisicao(endpoint, metodo = 'GET', body = null, requerAutenticacao = false) {
  const headers = { 'Content-Type': 'application/json' };

  if (requerAutenticacao) {
    if (!tokenGlobal) {
      console.log('\n Erro: Precisa de fazer login primeiro!\n');
      return null;
    }
    headers['Authorization'] = `Bearer ${tokenGlobal}`;
  }

  try {
    const opcoes = { method: metodo, headers };
    if (body) opcoes.body = JSON.stringify(body);

    const resposta = await fetch(`${API_URL}${endpoint}`, opcoes);
    const dados = await resposta.json();

    if (!resposta.ok) {
      console.log(`\n Erro (${resposta.status}):`, dados.erro || 'Erro na requisição.');
      return null;
    }

    return dados;
  } catch (erro) {
    console.log('\n Erro de conexão com o servidor. Verifique se a API está em execução.');
    return null;
  }
}

// Submenu de Autenticação
async function menuAutenticacao() {
  console.log('\n--- 🔑 AUTENTICAÇÃO ---');
  console.log('1. Cadastrar Utilizador');
  console.log('2. Fazer Login');
  console.log('3. Encerrar Sessão (Logout)');
  console.log('0. Voltar');

  const opcao = await pergunta('Escolha uma opção: ');

  if (opcao === '1') {
    const nome = await pergunta('Nome: ');
    const username = await pergunta('Username: ');
    const email = await pergunta('E-mail: ');
    const senha = await pergunta('Senha: ');
    const perfilInput = await pergunta('Perfil (1 - CLIENTE / 2 - ADMIN) [Padrão: 1]: ');

    const role = perfilInput === '2' ? 'ADMIN' : 'CLIENTE';

    const res = await fazerRequisicao('/auth/cadastrar', 'POST', { nome, username, email, senha, role });
    if (res) console.log(`\n✅ Utilizador cadastrado com sucesso como ${res.usuario.role}!`, res.usuario);
  } else if (opcao === '2') {
    const login = await pergunta('Login (e-mail ou username): ');
    const senha = await pergunta('Senha: ');

    const res = await fazerRequisicao('/auth/login', 'POST', { login, senha });
    if (res) {
      tokenGlobal = res.token;
      usuarioLogado = res.usuario;
      console.log(`\n✅ Login efetuado com sucesso! Bem-vindo(a), ${usuarioLogado.nome} [Perfil: ${usuarioLogado.role}]`);
    }
  } else if (opcao === '3') {
    tokenGlobal = '';
    usuarioLogado = null;
    console.log('\n✅ Sessão encerrada com sucesso!');
  }
}

// Submenu de Artistas (Apenas ADMIN)
async function menuArtistas() {
  console.log('\n--- 🎤 GESTÃO DE ARTISTAS (Apenas ADMIN) ---');
  console.log('1. Listar Artistas');
  console.log('2. Criar Artista');
  console.log('3. Atualizar Artista');
  console.log('4. Remover Artista');
  console.log('0. Voltar');

  const opcao = await pergunta('Escolha uma opção: ');

  if (opcao === '1') {
    const artistas = await fazerRequisicao('/artistas');
    if (artistas) {
      console.log('\n Lista de Artistas:');
      console.table(artistas);
    }
  } else if (opcao === '2') {
    const nome = await pergunta('Nome do Artista: ');
    const res = await fazerRequisicao('/artistas', 'POST', { nome }, true);
    if (res) console.log('\n✅ Artista criado:', res.artista);
  } else if (opcao === '3') {
    const id = await pergunta('ID do Artista a atualizar: ');
    const nome = await pergunta('Novo Nome do Artista: ');
    const res = await fazerRequisicao(`/artistas/${id}`, 'PUT', { nome }, true);
    if (res) console.log('\n✅ Artista atualizado com sucesso!', res.artista);
  } else if (opcao === '4') {
    const id = await pergunta('ID do Artista a remover: ');
    const res = await fazerRequisicao(`/artistas/${id}`, 'DELETE', null, true);
    if (res) console.log('\n✅ Artista removido com sucesso!');
  }
}

// Submenu de Locais (Apenas ADMIN)
async function menuLocais() {
  console.log('\n--- GESTÃO DE LOCAIS (Apenas ADMIN) ---');
  console.log('1. Listar Locais');
  console.log('2. Criar Local');
  console.log('3. Remover Local');
  console.log('0. Voltar');

  const opcao = await pergunta('Escolha uma opção: ');

  if (opcao === '1') {
    const locais = await fazerRequisicao('/locais');
    if (locais) {
      console.log('\n Lista de Locais:');
      console.table(locais);
    }
  } else if (opcao === '2') {
    const nome = await pergunta('Nome do Local: ');
    const cidade = await pergunta('Cidade: ');
    const capacidade = await pergunta('Capacidade (opcional): ');

    const res = await fazerRequisicao(
      '/locais',
      'POST',
      { nome, cidade, capacidade: capacidade ? Number(capacidade) : null },
      true
    );
    if (res) console.log('\n✅ Local criado:', res.local);
  } else if (opcao === '3') {
    const id = await pergunta('ID do Local a remover: ');
    const res = await fazerRequisicao(`/locais/${id}`, 'DELETE', null, true);
    if (res) console.log('\n✅ Local removido com sucesso!');
  }
}

// Submenu de Shows (Apenas ADMIN)
async function menuShowsAdmin() {
  console.log('\n--- 🎸 GESTÃO DE SHOWS (Apenas ADMIN) ---');
  console.log('1. Listar Shows');
  console.log('2. Criar Show');
  console.log('3. Atualizar Show');
  console.log('4. Remover Show');
  console.log('0. Voltar');

  const opcao = await pergunta('Escolha uma opção: ');

  if (opcao === '1') {
    await listarShows();
  } else if (opcao === '2') {
    console.log('\n Dica: Verifique os IDs de Artista e Local nas respetivas listagens antes de criar.');
    const artistaId = await pergunta('ID do Artista: ');
    const localId = await pergunta('ID do Local: ');
    const dataHoraInput = await pergunta('Data e Hora (Exemplo: 2026-11-20 21:00 ou 2026-11-20T21:00:00): ');
    const setores = await pergunta('Setores (ex: Pista, VIP): ');

    const dataHoraFormatted = dataHoraInput.includes(' ') 
      ? dataHoraInput.replace(' ', 'T') 
      : dataHoraInput;
    
    const res = await fazerRequisicao(
      '/shows',
      'POST',
      {
        artistaId: Number(artistaId),
        localId: Number(localId),
        dataHora: dataHoraFormatted,
        setores
      },
      true
    );

    if (res) console.log('\n✅ Show cadastrado com sucesso!', res.show);
  } else if (opcao === '3') {
    const id = await pergunta('ID do Show a atualizar: ');
    const dataHoraInput = await pergunta('Nova Data/Hora (Deixe em branco para não alterar): ');
    const setores = await pergunta('Novos Setores (Deixe em branco para não alterar): ');

    const body = {};
    if (dataHoraInput) {
      body.dataHora = dataHoraInput.includes(' ') 
        ? dataHoraInput.replace(' ', 'T') 
        : dataHoraInput;
    }
    if (setores) body.setores = setores;

    const res = await fazerRequisicao(`/shows/${id}`, 'PUT', body, true);
    if (res) console.log('\n✅ Show atualizado com sucesso!', res.show);
  } else if (opcao === '4') {
    const id = await pergunta('ID do Show a remover: ');
    const res = await fazerRequisicao(`/shows/${id}`, 'DELETE', null, true);
    if (res) console.log('\n✅ Show removido com sucesso!');
  }
}

// Consulta de Shows
async function listarShows() {
  const shows = await fazerRequisicao('/shows');
  if (shows) {
    console.log('\n Lista de Shows Disponíveis:');
    const formatados = shows.map((s) => ({
      ID: s.id,
      DataHora: s.dataHora,
      Setores: s.setores,
      Artista: s.artista ? s.artista.nome : s.artistaId,
      Local: s.local ? s.local.nome : s.localId
    }));
    console.table(formatados);
  }
}

// Submenu de Ingressos
async function menuIngressos() {
  console.log('\n--- 🎟️ COMPRA E CONSULTA DE INGRESSOS ---');
  console.log('1. Ver Meus Ingressos');
  console.log('2. Comprar Ingresso');
  console.log('0. Voltar');

  const opcao = await pergunta('Escolha uma opção: ');

  if (opcao === '1') {
    const ingressos = await fazerRequisicao('/ingressos/meus-ingressos', 'GET', null, true);
    if (ingressos) {
      console.log('\n Seus Ingressos:');
      console.table(ingressos.map(i => ({
        ID: i.id,
        Tipo: i.tipo,
        Quantidade: i.quantidade,
        Show: i.show ? i.show.artista.nome : i.showId,
        Local: i.show ? i.show.local.nome : 'N/A',
        Data: i.show ? i.show.dataHora : 'N/A'
      })));
    }
  }
  
  else if (opcao === '2') {
  await listarShows();
  const showId = await pergunta('\nID do Show para compra: ');
  console.log('\nTipos disponíveis:\n- PISTA\n- VIP\n- CAMAROTE\n- CADEIRA_SUPERIOR\n- CADEIRA_INFERIOR\n- ARQUIBANCADA');
  
  const tipoInput = await pergunta('\nTipo de Ingresso: ');
  const quantidade = await pergunta('Quantidade: ');

  // Formata o input do utilizador (ex: "cadeira superior" vira "CADEIRA_SUPERIOR")
  const tipo = tipoInput.trim().toUpperCase().replace(/\s+/g, '_');

  const res = await fazerRequisicao(
    '/ingressos/comprar',
    'POST',
    { showId: Number(showId), tipo, quantidade: Number(quantidade) },
    true
  );

  if (res) console.log('\n✅ Compra realizada com sucesso!', res.ingresso);
  }
}

// Menu Principal
async function menuPrincipal() {
  let sair = false;

  while (!sair) {
    console.log('\n====================================');
    console.log('    SISTEMA DE GESTÃO DE SHOWS    ');
    console.log('====================================');
    
    if (usuarioLogado) {
      console.log(`Sessão: 🔓 ${usuarioLogado.nome} (Perfil: ${usuarioLogado.role})`);
    } else {
      console.log('Sessão: 🔒 Não Autenticado');
    }

    console.log('1. Autenticação (Login / Registo)');

    if (usuarioLogado && usuarioLogado.role === 'ADMIN') {
      console.log('2. Gerenciar Artistas (ADMIN)');
      console.log('3. Gerenciar Locais (ADMIN)');
      console.log('4. Gerenciar Shows (ADMIN)');
      console.log('5. Compra e Consulta de Ingressos');
    } else {
      console.log('2. Consultar Shows Disponíveis');
      console.log('3. Compra e Consulta de Ingressos');
    }

    console.log('0. Sair');

    const opcao = await pergunta('\nEscolha uma opção: ');

    if (usuarioLogado && usuarioLogado.role === 'ADMIN') {
      switch (opcao) {
        case '1': await menuAutenticacao(); break;
        case '2': await menuArtistas(); break;
        case '3': await menuLocais(); break;
        case '4': await menuShowsAdmin(); break;
        case '5': await menuIngressos(); break;
        case '0':
          sair = true;
          console.log('\nA encerrar o sistema... Até breve!');
          rl.close();
          break;
        default: console.log('\n Opção inválida!');
      }
    } else {
      switch (opcao) {
        case '1': await menuAutenticacao(); break;
        case '2': await listarShows(); break;
        case '3': await menuIngressos(); break;
        case '0':
          sair = true;
          console.log('\nA encerrar o sistema... Até breve!');
          rl.close();
          break;
        default: console.log('\n Opção inválida!');
      }
    }
  }
}

menuPrincipal();