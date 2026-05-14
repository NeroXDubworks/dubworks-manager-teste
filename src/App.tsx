import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "/Logo_dubworks.png";

type Cargo =
  | "diretoria"
  | "adm"
  | "adm_treinamento"
  | "lider"
  | "lider_treinamento"
  | "editor"
  | "membro";

type TrainingStatus =
  | "nao_aplicavel"
  | "pendente"
  | "em_andamento"
  | "concluido"
  | "reprovado";

type StatusMembro = "na_comunidade" | "saiu" | "banido" | "pausado";

type Usuario = {
  id?: number;
  nome: string;
  login: string;
  senha?: string | null;
  cargo: Cargo;
  vinculo: string;
  training_status?: TrainingStatus;
  criado_por?: string | null;
  data_criacao?: string | null;
  acesso_projetos?: boolean | null;
  acesso_membros?: boolean | null;
  acesso_usuarios?: boolean | null;
  acesso_relatorios_projetos?: boolean | null;
  acesso_relatorios_elenco?: boolean | null;
  acesso_relatorios_membros?: boolean | null;
  acesso_relatorios_entrada_saida?: boolean | null;
  acesso_exportacoes?: boolean | null;
  acesso_treinamentos?: boolean | null;
};

type ChavePermissao =
  | "acesso_projetos"
  | "acesso_membros"
  | "acesso_usuarios"
  | "acesso_relatorios_projetos"
  | "acesso_relatorios_elenco"
  | "acesso_relatorios_membros"
  | "acesso_relatorios_entrada_saida"
  | "acesso_exportacoes"
  | "acesso_treinamentos";

const permissoesDisponiveis: { chave: ChavePermissao; label: string }[] = [
  { chave: "acesso_projetos", label: "Projetos" },
  { chave: "acesso_membros", label: "Membros" },
  { chave: "acesso_usuarios", label: "Usuários" },
  { chave: "acesso_relatorios_projetos", label: "Relatório de projetos" },
  { chave: "acesso_relatorios_elenco", label: "Relatório de elenco" },
  { chave: "acesso_relatorios_membros", label: "Relatório de membros" },
  { chave: "acesso_relatorios_entrada_saida", label: "Entrada e saída" },
  { chave: "acesso_exportacoes", label: "Exportações" },
  { chave: "acesso_treinamentos", label: "Treinamentos" },
];

type ElencoItem = {
  id: string;
  personagem: string;
  dublador: string;
  telefone_dublador?: string;
  funcao: string;
};

type DriveStructureResult = {
  pasta?: string;
  selecao?: string;
  projeto?: string;
  finalizados?: string;
  pastaId?: string;
  selecaoId?: string;
  projetoId?: string;
  finalizadosId?: string;
};

type Projeto = {
  ID: string;
  Projeto: string;
  Tipo: string;
  Genero: string;
  Prioridade: string;
  Dupla: string;
  Lider: string;
  Telefone_Lider: string;
  Editor: string;
  Telefone_Editor: string;
  Status: string;
  Data_Inicio: string;
  Video_Editor_Link: string;
  Registro_Semanal: string;
  Observacoes: string;
  Capa_URL: string;
  Drive_Pasta_Link: string;
  Drive_Videos_Link: string;
  Drive_Cortes_Link: string;
  Drive_Final_Link: string;
  Arquivado: boolean;
  Elenco: ElencoItem[];
};

type Membro = {
  id?: number;
  nome: string;
  telefone: string;
  email: string;
  data_nascimento?: string | null;
  idade?: number | null;
  habilidades?: string | null;
  motivacao?: string | null;
  status: StatusMembro;
  data_entrada?: string | null;
  data_saida?: string | null;
  observacao?: string | null;
};

type RelatorioMes = {
  mes: string;
  mesLabel: string;
  totalInicial: number;
  entradas: number;
  saidas: number;
  crescimento: number;
  totalFinal: number;
};

type RespostaTreinamento = {
  id?: number;
  usuario_login: string;
  usuario_nome: string;
  usuario_cargo: string;
  modulo_id: string;
  modulo_titulo: string;
  pergunta: string;
  alternativa_marcada: number;
  alternativa_texto: string;
  alternativa_correta: number;
  correta: boolean;
  explicacao: string;
  data_resposta?: string | null;
};

type PerguntaTreinamento = {
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
};

type ModuloTreinamento = {
  id: string;
  titulo: string;
  descricao: string;
  conteudos: string[];
  checklist: string[];
  pergunta?: PerguntaTreinamento;
};

const modulosTreinamentoLider: ModuloTreinamento[] = [
  {
    id: "papel-lider",
    titulo: "1. O papel do líder de projetos",
    descricao:
      "Entender, de forma completa, o que é um líder de projetos e qual responsabilidade ele assume dentro da DubWorks.",
    conteudos: [
      "O líder de projetos é a pessoa responsável por transformar uma ideia em uma produção organizada. Ele acompanha o projeto desde a preparação até a entrega final.",
      "Na DubWorks, o líder não é apenas alguém que cria grupo e manda aviso. Ele precisa garantir que o projeto tenha planejamento, pasta organizada, seleção clara, elenco definido, prazos combinados, acompanhamento de entregas e registros no sistema.",
      "O líder funciona como uma ponte entre diretoria, editor e elenco. Quando alguém tem dúvida sobre prazo, personagem, pasta, formulário ou entrega, o líder precisa saber orientar ou buscar a resposta com a diretoria.",
      "O líder não substitui a diretoria. A diretoria acompanha decisões maiores, aprova organização, orienta processos e pode interferir quando há problema grave, atraso recorrente ou desorganização.",
      "O líder também não substitui o editor. O editor cuida da montagem/edição do material, enquanto o líder acompanha se o elenco entregou, se os arquivos estão no lugar certo e se o projeto está avançando.",
      "A função principal do líder é manter o projeto vivo, organizado e rastreável. Se a diretoria abrir o DubWorks Manager, precisa entender o que está acontecendo sem depender de mensagens perdidas no WhatsApp.",
      "Um bom líder precisa ter responsabilidade, comunicação, paciência, organização, atenção aos detalhes e compromisso com os registros semanais.",
      "Se o projeto está parado, o líder precisa registrar. Se alguém sumiu, precisa registrar. Se o Drive está errado, precisa registrar. Se a edição avançou, também precisa registrar.",
    ],
    checklist: [
      "Entendeu o papel do líder",
      "Entendeu que o líder organiza o projeto do início ao fim",
      "Entendeu a diferença entre líder, editor e diretoria",
      "Entendeu que tudo precisa ficar registrado no sistema",
    ],
    pergunta: {
      pergunta:
        "Qual é a principal função do líder de projetos dentro da DubWorks?",
      alternativas: [
        "Apenas escolher os dubladores e deixar o resto com a diretoria.",
        "Organizar, acompanhar, comunicar e registrar o andamento do projeto do início ao fim.",
        "Fazer a edição final de todos os vídeos.",
        "Criar grupos no WhatsApp sem precisar acompanhar as entregas.",
      ],
      correta: 1,
      explicacao:
        "O líder é responsável por manter o projeto organizado, acompanhar entregas, comunicar problemas e registrar tudo no sistema.",
    },
  },
  {
    id: "responsabilidades",
    titulo: "2. Funções e responsabilidades do líder",
    descricao:
      "Aprender todas as responsabilidades práticas que o líder assume ao cuidar de um projeto.",
    conteudos: [
      "Antes de abrir uma seleção, o líder precisa planejar o projeto. Isso inclui entender o tipo de projeto, a duração, a quantidade de personagens, a dificuldade e o prazo realista.",
      "O líder deve organizar as pastas do projeto no Drive seguindo o padrão da DubWorks. Isso evita arquivos perdidos e facilita a revisão da diretoria.",
      "O líder também precisa preparar os formulários. Um formulário mal configurado pode impedir o envio dos testes ou misturar arquivos de personagens diferentes.",
      "Durante a seleção, o líder deve divulgar corretamente o projeto, conferir se os links funcionam e responder dúvidas básicas dos membros.",
      "Depois da seleção, o líder organiza o elenco, registra os personagens no sistema e orienta cada dublador sobre o que precisa entregar.",
      "Durante a produção, o líder acompanha gravações, cobra pendências com respeito, mantém contato com o editor e avisa a diretoria quando algo sai do controle.",
      "Toda semana, mesmo que nada tenha acontecido, o líder precisa registrar o status. Um projeto sem registro parece abandonado.",
      "Se houver troca de líder, troca de editor, atraso, substituição de dublador, correção de link ou entrega final, isso precisa aparecer no histórico/registro do projeto.",
    ],
    checklist: [
      "Sabe planejar antes de abrir seleção",
      "Sabe organizar Drive",
      "Sabe preparar formulários",
      "Sabe acompanhar entregas",
      "Sabe registrar andamento",
    ],
    pergunta: {
      pergunta:
        "O que o líder deve fazer quando um projeto fica parado ou sem entregas?",
      alternativas: [
        "Não fazer nada e esperar alguém perguntar.",
        "Apagar o projeto do sistema.",
        "Registrar a situação, identificar o motivo e comunicar a diretoria se necessário.",
        "Culpar o editor e sair do projeto.",
      ],
      correta: 2,
      explicacao:
        "Projeto parado também precisa de registro. A diretoria precisa saber o motivo e o próximo passo.",
    },
  },
  {
    id: "sistema",
    titulo: "3. Como mexer no DubWorks Manager",
    descricao:
      "Aprender a usar o sistema interno da DubWorks para criar, acompanhar e atualizar projetos.",
    conteudos: [
      "O DubWorks Manager é o painel interno usado para acompanhar projetos, elenco, links, registros e histórico. Ele existe para reduzir bagunça e impedir que informações importantes fiquem perdidas no WhatsApp.",
      "Ao entrar no sistema, o líder deve acessar a aba Projetos. Nela aparecem os projetos vinculados ao nome ou vínculo do usuário cadastrado.",
      "Para abrir um projeto, clique na linha dele. A visualização do projeto mostra abas internas: Informações, Elenco, Registros Semanais, Arquivos do Drive, Atividades e Histórico.",
      "Na aba Informações, ficam os dados principais: nome do projeto, tipo, gênero, prioridade, status, líder, editor, data, capa, observações e outros campos de controle.",
      "Na aba Elenco, o líder adiciona personagens, informa quem dubla cada personagem, remove personagens incorretos e usa o botão Salvar elenco para gravar a alteração.",
      "Na aba Registros Semanais, o líder escreve o andamento real do projeto. Exemplo: 'Semana 02: 4 dubladores entregaram, 2 pendentes, edição ainda não iniciada'.",
      "Na aba Arquivos do Drive, o líder registra os links principais do projeto: pasta principal, cortes/cenas, materiais de personagens e finalizados.",
      "Na aba Histórico, aparecem alterações importantes feitas no projeto. O histórico ajuda a entender quem alterou algo e quando.",
      "Sempre que mexer em dados importantes, o líder deve clicar no botão de salvar/atualizar correspondente. Se não salvar, a informação pode ficar só na tela e se perder.",
      "O líder deve evitar colocar informações soltas em observações quando já existe campo específico para aquilo. Link vai em Drive, andamento vai em Registro Semanal, elenco vai em Elenco.",
    ],
    checklist: [
      "Sabe abrir projeto",
      "Sabe usar Informações",
      "Sabe usar Elenco",
      "Sabe usar Drive",
      "Sabe usar Registros Semanais",
      "Sabe conferir Histórico",
    ],
    pergunta: {
      pergunta: "Onde o líder deve registrar o andamento semanal do projeto?",
      alternativas: [
        "Apenas no grupo do WhatsApp.",
        "Na aba Registros Semanais do projeto.",
        "No nome do projeto.",
        "Somente no campo de gênero.",
      ],
      correta: 1,
      explicacao:
        "O andamento deve ficar no sistema, na aba Registros Semanais, para a diretoria conseguir acompanhar.",
    },
  },
  {
    id: "planejamento",
    titulo: "4. Planejamento do projeto teste",
    descricao:
      "Aprender a planejar um projeto pequeno, rápido e adequado para treinamento de liderança.",
    conteudos: [
      "No treinamento, o líder deve organizar um projeto teste. Esse projeto serve para mostrar se ele sabe conduzir uma produção real, mas em tamanho reduzido.",
      "O projeto teste pode ser uma comic curta, uma cena pequena, um vídeo curto ou um material de aproximadamente 5 minutos.",
      "Antes de abrir seleção, o líder precisa definir o nome do projeto, tipo, gênero, quantidade de personagens, tempo de duração, prazo de seleção, prazo de entrega e responsável pela edição.",
      "O líder deve evitar começar projetos grandes no treinamento. Projetos longos exigem mais experiência, mais cobrança e mais risco de abandono.",
      "Para vídeos e episódios, uma referência inicial é 1 semana para aproximadamente 5 minutos de vídeo. Se houver muita dificuldade, o prazo pode ser ajustado com aprovação.",
      "Para comics, HQs ou mangás, uma referência inicial é 1 semana para 1 capítulo inteiro, dependendo do tamanho.",
      "O planejamento precisa ser claro o suficiente para outra pessoa entender o projeto sem precisar perguntar tudo no privado.",
      "Depois de planejar, o líder deve registrar o projeto no sistema e manter as informações atualizadas.",
    ],
    checklist: [
      "Definiu projeto teste",
      "Definiu escopo",
      "Definiu personagens",
      "Definiu prazos",
      "Definiu edição",
      "Registrou no sistema",
    ],
    pergunta: {
      pergunta:
        "Qual tipo de projeto é mais indicado para treinamento de líder?",
      alternativas: [
        "Um projeto enorme com várias temporadas.",
        "Um projeto pequeno, como comic curta, cena ou vídeo de cerca de 5 minutos.",
        "Um projeto sem prazo definido.",
        "Um projeto sem editor e sem pasta organizada.",
      ],
      correta: 1,
      explicacao:
        "No treinamento, o ideal é um projeto pequeno para avaliar organização, comunicação e entrega.",
    },
  },
  {
    id: "pastas",
    titulo: "5. Estrutura de pastas no Drive",
    descricao:
      "Aprender a criar e organizar pastas dentro de pastas seguindo o padrão real da DubWorks.",
    conteudos: [
      "A organização do Drive é uma das partes mais importantes do trabalho do líder. Uma pasta mal organizada atrasa elenco, editor e diretoria.",
      "A estrutura oficial da DubWorks é dividida em 3 pastas principais dentro da pasta do projeto: 1 | Seleção, 2 | Projeto e 3 | Finalizado.",
      "A pasta 1 | Seleção deve guardar tudo que pertence à fase de seleção: falas teste, formulário de seleção, testes enviados e resultado final da seleção.",
      "A pasta 2 | Projeto deve guardar tudo que pertence à produção em andamento: cortes, cenas, áudios recebidos, materiais de edição, andamento semanal e organização interna do projeto.",
      "A pasta 3 | Finalizado deve guardar tudo que já está concluído: vídeos finais, créditos, thumbs, renders, capas e arquivos finais do projeto.",
      "Dentro da pasta 1 | Seleção, as falas teste devem ser claras, curtas e separadas por personagem. O ideal é que cada teste tenha até 30 segundos.",
      "Os arquivos de teste devem seguir o padrão: [Feminino] Nome, [Masculino] Nome ou [S/Gênero] Nome. Isso ajuda os membros a identificarem personagens e evita confusão.",
      "Dentro da pasta 2 | Projeto, o líder pode criar subpastas por episódio, semana, cena, parte ou personagem, dependendo do tipo de produção.",
      "Para episódios, use o padrão: [EP-XX] Semana XX | Parte YY. Exemplo: [EP-01] Semana 01 | Parte 02.",
      "Para comics/HQs, use o padrão: [CP-XX] Página YY. Exemplo: [CP-01] Página 05.",
      "Para cenas ou vídeos curtos, use o padrão: [S-XX] Parte YY. Exemplo: [S-01] Parte 03.",
      "Cada parte de vídeo deve ter aproximadamente 1 minuto, podendo chegar no máximo a 1 minuto e 30 segundos quando necessário.",
      "Depois de criar as pastas, os links principais devem ser salvos no DubWorks Manager, principalmente pasta principal, cortes/cenas e finalizados.",
    ],
    checklist: [
      "Criou pasta 1 | Seleção",
      "Criou pasta 2 | Projeto",
      "Criou pasta 3 | Finalizado",
      "Organizou falas teste",
      "Organizou cortes/cenas",
      "Salvou links no sistema",
    ],
    pergunta: {
      pergunta: "Qual é a estrutura oficial principal de pastas da DubWorks?",
      alternativas: [
        "01 - Falas Teste, 02 - Cortes, 03 - Edição e 04 - Materiais.",
        "1 | Seleção, 2 | Projeto e 3 | Finalizado.",
        "Teste, Render, Aleatórios e Antigos.",
        "Somente uma pasta única com todos os arquivos misturados.",
      ],
      correta: 1,
      explicacao:
        "A estrutura oficial é formada por três pastas principais: 1 | Seleção, 2 | Projeto e 3 | Finalizado.",
    },
  },
  {
    id: "formularios",
    titulo: "6. Criação de formulários",
    descricao:
      "Aprender a criar formulários para seleção e entrega de falas/vídeos.",
    conteudos: [
      "Os formulários são essenciais porque os vídeos, áudios e testes dos membros geralmente são entregues por lá.",
      "O líder deve criar ou adaptar um formulário para seleção. Esse formulário recebe os testes dos membros interessados nos personagens.",
      "O formulário de seleção deve ter título claro com o nome do projeto, descrição com prazo, link para falas teste, campo para nome do membro, contato e personagem escolhido.",
      "Também precisa ter campo de upload para o membro enviar o teste. Se o upload não estiver funcionando, o processo inteiro fica comprometido.",
      "O líder também deve criar ou adaptar um formulário de entrega. Esse formulário é usado depois da seleção, quando os dubladores oficiais enviam suas falas.",
      "O formulário de entrega deve pedir nome do membro, personagem, parte/semana, observações e arquivo enviado.",
      "A descrição do formulário deve explicar o padrão de envio: áudio limpo, sem efeitos desnecessários, nome correto e envio dentro do prazo.",
      "Antes de divulgar qualquer formulário, o líder precisa testar como se fosse um membro. Isso evita problema de permissão, campo obrigatório faltando ou upload bloqueado.",
      "Depois que os arquivos chegarem, o líder deve organizar as respostas e mover/identificar os arquivos dentro da pasta correta do Drive.",
      "Os links dos formulários e pastas importantes devem ser registrados no sistema para a diretoria conseguir consultar.",
    ],
    checklist: [
      "Criou formulário de seleção",
      "Criou formulário de entrega",
      "Configurou upload",
      "Testou envio",
      "Organizou respostas",
      "Salvou links",
    ],
    pergunta: {
      pergunta:
        "O que o líder deve fazer antes de divulgar um formulário para os membros?",
      alternativas: [
        "Divulgar rápido sem testar.",
        "Testar o formulário, verificar campos, prazo, link e upload.",
        "Pedir para o editor resolver depois.",
        "Deixar sem campo de upload.",
      ],
      correta: 1,
      explicacao:
        "O líder precisa testar o formulário antes de divulgar para garantir que o envio funciona corretamente.",
    },
  },
  {
    id: "avisos",
    titulo: "7. Avisos e comunicação do projeto",
    descricao:
      "Aprender a divulgar seleção, lembretes, encerramento e resultado de forma clara.",
    conteudos: [
      "A comunicação do líder precisa ser clara, completa e organizada. Aviso confuso gera dúvidas, atraso e retrabalho.",
      "O aviso de abertura de seleção deve informar nome do projeto, breve descrição, personagens disponíveis, prazo, link das falas teste, link do formulário e contato do líder/editor.",
      "O líder precisa conferir se todos os links estão abrindo antes de divulgar. Link quebrado passa impressão de desorganização.",
      "Durante a seleção, o líder deve enviar lembretes. Exemplos: faltam 3 dias, faltam 2 dias, último dia e seleção encerrada.",
      "O aviso de encerramento deve informar que o prazo acabou e que os testes serão analisados.",
      "O resultado da seleção deve listar personagem e dublador escolhido de forma clara.",
      "Depois do resultado, o líder deve orientar o elenco sobre próximo passo: grupo, prazo de entrega, pasta do projeto e formulário de envio.",
      "O líder deve evitar discussões públicas, indiretas e cobranças agressivas. Cobrança deve ser firme, mas respeitosa.",
    ],
    checklist: [
      "Criou aviso de abertura",
      "Incluiu links",
      "Criou lembretes",
      "Criou encerramento",
      "Divulgou resultado",
      "Orientou próximos passos",
    ],
    pergunta: {
      pergunta: "O que um aviso de abertura de seleção precisa conter?",
      alternativas: [
        "Somente o nome do projeto.",
        "Nome do projeto, prazo, links, personagens e contato do responsável.",
        "Apenas uma imagem bonita.",
        "Somente o link do grupo.",
      ],
      correta: 1,
      explicacao:
        "O aviso precisa ter informações suficientes para o membro entender o projeto e participar sem confusão.",
    },
  },
  {
    id: "execucao",
    titulo: "8. Execução do projeto prático",
    descricao:
      "Aprender a conduzir um projeto curto sozinho para demonstrar preparo como líder.",
    conteudos: [
      "A execução do projeto prático é a parte em que o líder mostra se sabe aplicar o treinamento.",
      "O projeto deve ser pequeno, como uma comic curta, cena rápida ou vídeo de aproximadamente 5 minutos.",
      "O líder deve criar o projeto no sistema, organizar as pastas, criar formulários, abrir seleção, definir elenco e acompanhar entregas.",
      "Durante a execução, o líder precisa observar quem entregou, quem atrasou, quem sumiu e quem precisa ser substituído.",
      "Se houver atraso, o líder deve cobrar com respeito e registrar no sistema. Se o problema continuar, deve avisar a diretoria.",
      "O líder precisa manter contato com o editor, porque o projeto não termina quando os áudios chegam. A edição também precisa ser acompanhada.",
      "Mesmo em projeto curto, o líder deve registrar andamento. Isso mostra maturidade e organização.",
      "O objetivo do projeto prático não é ser perfeito, mas demonstrar que o líder consegue organizar, conduzir, registrar e finalizar.",
    ],
    checklist: [
      "Criou projeto teste",
      "Organizou pastas",
      "Criou formulários",
      "Selecionou elenco",
      "Acompanhou entregas",
      "Registrou andamento",
      "Enviou finalizado",
    ],
    pergunta: {
      pergunta:
        "Qual é o objetivo principal do projeto prático no treinamento?",
      alternativas: [
        "Fazer o maior projeto possível.",
        "Mostrar que o líder sabe organizar, conduzir, registrar e finalizar um projeto curto.",
        "Evitar usar o sistema.",
        "Deixar tudo para a diretoria resolver.",
      ],
      correta: 1,
      explicacao:
        "O projeto prático serve para avaliar organização, comunicação, registro e entrega em um projeto pequeno.",
    },
  },
  {
    id: "resultado",
    titulo: "9. Upload do resultado no sistema",
    descricao:
      "Aprender a registrar o resultado final e os links corretos dentro do DubWorks Manager.",
    conteudos: [
      "Quando o projeto tiver resultado ou material finalizado, o líder precisa organizar esse material no Drive e registrar o link no sistema.",
      "O resultado pode ser vídeo final, render, pasta finalizada, créditos, thumb/capa ou arquivo editado.",
      "O material final deve ficar dentro da pasta 3 | Finalizado, para que a diretoria e equipe encontrem rapidamente.",
      "No DubWorks Manager, o líder deve colocar os links na aba Arquivos do Drive.",
      "Depois de colar os links, o líder precisa clicar para salvar. Se não salvar, a informação pode sumir ao recarregar.",
      "Depois de salvar, o líder deve conferir se o histórico registrou a ação ou se a informação ficou visível no projeto.",
      "Na aba Registros Semanais, o líder deve escrever algo como: 'Projeto finalizado e link salvo na pasta Finalizado'.",
      "A diretoria precisa abrir o projeto e encontrar o caminho do material final sem procurar em conversa antiga.",
      "Um projeto não deve ser considerado encerrado se os arquivos finais não estão organizados e registrados.",
    ],
    checklist: [
      "Organizou finalizado",
      "Salvou link no sistema",
      "Registrou entrega",
      "Conferiu histórico",
      "Diretoria consegue acessar",
    ],
    pergunta: {
      pergunta: "Onde o líder deve guardar e registrar o material finalizado?",
      alternativas: [
        "Apenas no WhatsApp.",
        "Na pasta 3 | Finalizado e nos links do DubWorks Manager.",
        "Em qualquer pasta pessoal sem avisar.",
        "Somente no computador do editor.",
      ],
      correta: 1,
      explicacao:
        "O material final precisa ficar organizado no Drive e com link registrado no sistema.",
    },
  },
  {
    id: "prova-final",
    titulo: "10. Prova final do líder",
    descricao:
      "Responder perguntas de revisão geral para concluir a parte teórica do treinamento.",
    conteudos: [
      "A prova final serve para revisar tudo que foi aprendido: função do líder, sistema, pastas, formulários, avisos, execução e finalização.",
      "A prova não substitui a avaliação prática. Ela confirma se o líder entendeu o processo antes de ser avaliado pela diretoria.",
      "O líder deve responder com atenção. Se errar, deve voltar ao módulo correspondente e revisar o conteúdo.",
      "A diretoria pode usar o resultado da prova junto com o projeto prático para decidir se o líder está aprovado.",
    ],
    checklist: [
      "Revisou todos os módulos",
      "Respondeu a prova final",
      "Corrigiu pontos fracos",
    ],
    pergunta: {
      pergunta: "Para um líder ser aprovado, o que deve ser considerado?",
      alternativas: [
        "Somente simpatia no grupo.",
        "Apenas responder a prova, sem projeto prático.",
        "Leitura, prova, organização prática, uso do sistema, comunicação e entrega do projeto teste.",
        "Só criar uma pasta no Drive.",
      ],
      correta: 2,
      explicacao:
        "A aprovação deve considerar teoria e prática: prova, organização, comunicação, sistema e entrega.",
    },
  },
  {
    id: "avaliacao",
    titulo: "11. Avaliação final da diretoria",
    descricao:
      "A diretoria avalia se o líder em treinamento pode virar líder oficial.",
    conteudos: [
      "A avaliação final deve considerar o comportamento do líder durante todo o treinamento.",
      "A diretoria deve observar se o líder conseguiu entender o papel, organizar pastas, criar formulários, usar o sistema, abrir seleção, acompanhar entregas e registrar andamento.",
      "Também deve ser considerada a postura: comunicação, respeito, responsabilidade, capacidade de resolver problemas e pedir ajuda quando necessário.",
      "O líder pode ser aprovado, reprovado, pausado ou mantido em atenção.",
      "Se aprovado, o usuário pode deixar de ser líder em treinamento e virar líder oficial.",
      "Se reprovado, ele pode refazer módulos, repetir o projeto prático ou continuar em acompanhamento.",
      "A aprovação não deve ser baseada apenas em leitura. O líder precisa demonstrar prática.",
    ],
    checklist: [
      "Diretoria avaliou teoria",
      "Diretoria avaliou prática",
      "Diretoria avaliou comunicação",
      "Diretoria avaliou organização",
      "Status final foi definido",
    ],
    pergunta: {
      pergunta:
        "O que a diretoria deve avaliar antes de transformar alguém em líder oficial?",
      alternativas: [
        "Apenas se a pessoa pediu para virar líder.",
        "Organização, comunicação, uso do sistema, projeto prático e responsabilidade.",
        "Somente se a pessoa marcou todos os checkboxes.",
        "Apenas se ela gosta do projeto.",
      ],
      correta: 1,
      explicacao:
        "A diretoria deve avaliar o conjunto: postura, prática, organização, comunicação e uso correto do sistema.",
    },
  },
];

const projetoVazio: Projeto = {
  ID: "",
  Projeto: "",
  Tipo: "Projeto",
  Genero: "",
  Prioridade: "P0",
  Dupla: "",
  Lider: "",
  Telefone_Lider: "",
  Editor: "",
  Telefone_Editor: "",
  Status: "Planejamento",
  Data_Inicio: "",
  Video_Editor_Link: "",
  Registro_Semanal: "",
  Observacoes: "",
  Capa_URL: "",
  Drive_Pasta_Link: "",
  Drive_Videos_Link: "",
  Drive_Cortes_Link: "",
  Drive_Final_Link: "",
  Arquivado: false,
  Elenco: [],
};

const elencoVazio: ElencoItem = {
  id: "",
  personagem: "",
  dublador: "",
  funcao: "",
};

const estilos = {
  azul: "#38bdf8",
  azulEscuro: "#dbeafe",
  azulClaro: "rgba(56, 189, 248, 0.14)",
  borda: "rgba(148, 163, 184, 0.24)",
  texto: "#f8fafc",
  textoSuave: "#cbd5e1",
  fundo: "#050816",
  branco: "rgba(15, 23, 42, 0.94)",
};

function normalizar(valor?: string) {
  return (valor || "").trim().toLowerCase();
}

function cargoLabel(cargo: Cargo) {
  const labels: Record<Cargo, string> = {
    diretoria: "Diretoria",
    adm: "ADM",
    adm_treinamento: "ADM Treinamento",
    lider: "Líder",
    lider_treinamento: "Líder em treinamento",
    editor: "Editor",
    membro: "Membro",
  };
  return labels[cargo] || cargo;
}

function statusTreinamentoLabel(status?: TrainingStatus) {
  const labels: Record<TrainingStatus, string> = {
    nao_aplicavel: "Não aplicável",
    pendente: "Pendente",
    em_andamento: "Em andamento",
    concluido: "Concluído",
    reprovado: "Reprovado",
  };
  return labels[status || "nao_aplicavel"];
}

function statusMembroLabel(status?: StatusMembro) {
  const labels: Record<StatusMembro, string> = {
    na_comunidade: "Na comunidade",
    saiu: "Saiu",
    banido: "Banido",
    pausado: "Pausado",
  };
  return labels[status || "na_comunidade"];
}

function corStatusMembro(status?: StatusMembro) {
  const s = status || "na_comunidade";
  if (s === "na_comunidade")
    return { bg: "rgba(8,116,67,0.22)", color: "#087443" };
  if (s === "saiu") return { bg: "rgba(180,83,9,0.22)", color: "#f59e0b" };
  if (s === "banido") return { bg: "rgba(194,65,12,0.22)", color: "#fb7185" };
  return { bg: "rgba(37,99,235,0.20)", color: "#93c5fd" };
}

function statusPadraoPorCargo(cargo: Cargo): TrainingStatus {
  return cargo === "lider_treinamento" ? "em_andamento" : "nao_aplicavel";
}

function permissaoPadraoPorCargo(cargo: Cargo, chave: ChavePermissao) {
  if (cargo === "diretoria") return true;

  if (cargo === "adm") {
    return [
      "acesso_projetos",
      "acesso_membros",
      "acesso_usuarios",
      "acesso_relatorios_projetos",
      "acesso_relatorios_elenco",
      "acesso_exportacoes",
    ].includes(chave);
  }

  if (cargo === "adm_treinamento") {
    return ["acesso_usuarios", "acesso_treinamentos"].includes(chave);
  }

  if (cargo === "lider" || cargo === "lider_treinamento") {
    return [
      "acesso_projetos",
      "acesso_relatorios_elenco",
      "acesso_exportacoes",
    ].includes(chave);
  }

  if (cargo === "editor") {
    return ["acesso_projetos"].includes(chave);
  }

  return false;
}

function temAcesso(usuario: Usuario | null, chave: ChavePermissao) {
  if (!usuario) return false;
  if (usuario.cargo === "diretoria") return true;

  const valor = usuario[chave];
  if (typeof valor === "boolean") return valor;

  return permissaoPadraoPorCargo(usuario.cargo, chave);
}

function permissoesPadraoUsuario(cargo: Cargo) {
  return permissoesDisponiveis.reduce((acc, item) => {
    acc[item.chave] = permissaoPadraoPorCargo(cargo, item.chave);
    return acc;
  }, {} as Record<ChavePermissao, boolean>);
}

function podeVerProjeto(usuario: Usuario | null, projeto: Projeto) {
  if (!usuario) return false;

  const cargo = normalizar(usuario.cargo);
  const vinculo = normalizar(usuario.vinculo);
  const login = normalizar(usuario.login);
  const nome = normalizar(usuario.nome);
  const lider = normalizar(projeto.Lider);
  const editor = normalizar(projeto.Editor);

  if (["diretoria", "adm", "adm_treinamento"].indexOf(cargo) !== -1) {
    return true;
  }

  if (cargo === "lider" || cargo === "lider_treinamento") {
    return lider === vinculo || lider === login || lider === nome;
  }

  if (cargo === "editor") {
    return editor === vinculo || editor === login || editor === nome;
  }

  return false;
}

function podeEditarProjeto(usuario: Usuario | null, projeto: Projeto | null) {
  if (!usuario || !projeto) return false;

  const cargo = normalizar(usuario.cargo);
  const vinculo = normalizar(usuario.vinculo);
  const login = normalizar(usuario.login);
  const nome = normalizar(usuario.nome);
  const lider = normalizar(projeto.Lider);

  if (cargo === "diretoria" || cargo === "adm") return true;

  if (cargo === "lider" || cargo === "lider_treinamento") {
    return lider === vinculo || lider === login || lider === nome;
  }

  return false;
}

function podeCriarProjeto(usuario: Usuario | null) {
  if (!usuario) return false;
  return (
    ["diretoria", "adm", "lider", "lider_treinamento"].indexOf(
      usuario.cargo
    ) !== -1
  );
}

function podeSubirVideoEditor(
  usuario: Usuario | null,
  projeto: Projeto | null
) {
  if (!usuario || !projeto) return false;

  const cargo = normalizar(usuario.cargo);
  const vinculo = normalizar(usuario.vinculo);
  const login = normalizar(usuario.login);
  const nome = normalizar(usuario.nome);
  const editor = normalizar(projeto.Editor);

  if (["diretoria", "adm"].indexOf(cargo) !== -1) return true;
  if (cargo === "editor") {
    return editor === vinculo || editor === login || editor === nome;
  }
  return false;
}

function podeGerenciarUsuarios(usuario: Usuario | null) {
  return temAcesso(usuario, "acesso_usuarios");
}

function podeGerenciarMembros(usuario: Usuario | null) {
  return temAcesso(usuario, "acesso_membros");
}

function podeGerenciarTreinamentos(usuario: Usuario | null) {
  return temAcesso(usuario, "acesso_treinamentos");
}

function podeVerNotificacoesGerais(usuario: Usuario | null) {
  if (!usuario) return false;
  return usuario.cargo === "diretoria" || usuario.cargo === "adm";
}

function podeExcluirUsuario(usuarioLogado: Usuario | null, alvo: Usuario) {
  if (!usuarioLogado) return false;
  if (alvo.cargo === "diretoria" && usuarioLogado.cargo !== "diretoria")
    return false;
  if (usuarioLogado.cargo === "diretoria") return true;
  if (usuarioLogado.cargo === "adm") return alvo.cargo !== "diretoria";
  if (usuarioLogado.cargo === "adm_treinamento") {
    return alvo.cargo === "lider_treinamento";
  }
  return false;
}

function cargosPermitidosParaCriar(usuario: Usuario | null): Cargo[] {
  if (!usuario) return [];
  if (usuario.cargo === "diretoria") {
    return [
      "diretoria",
      "adm",
      "adm_treinamento",
      "lider",
      "lider_treinamento",
      "editor",
      "membro",
    ];
  }
  if (usuario.cargo === "adm") {
    return ["lider", "lider_treinamento", "editor", "membro"];
  }
  if (usuario.cargo === "adm_treinamento") {
    return ["lider_treinamento"];
  }
  return [];
}

function corStatus(status: string) {
  const s = normalizar(status);
  if (s.indexOf("conclu") !== -1 || s.indexOf("final") !== -1) {
    return { bg: "rgba(8,116,67,0.22)", color: "#087443" };
  }
  if (s.indexOf("exec") !== -1 || s.indexOf("andamento") !== -1) {
    return { bg: "rgba(37,99,235,0.20)", color: "#93c5fd" };
  }
  if (s.indexOf("interromp") !== -1 || s.indexOf("paus") !== -1) {
    return { bg: "rgba(194,65,12,0.22)", color: "#fb7185" };
  }
  if (s.indexOf("stand") !== -1) {
    return { bg: "rgba(37,99,235,0.20)", color: "#93c5fd" };
  }
  return { bg: "rgba(30,41,59,0.80)", color: "#cbd5e1" };
}

function escaparCSV(valor?: string) {
  const texto = String(valor || "").replace(/"/g, '""');
  return `"${texto}"`;
}

function mapUsuarioDb(item: any): Usuario {
  return {
    id: item.id,
    nome: item.nome || "",
    login: item.login || "",
    senha: item.senha || null,
    cargo: normalizar(item.cargo) as Cargo,
    vinculo: item.vinculo || "",
    training_status: (item.training_status ||
      "nao_aplicavel") as TrainingStatus,
    criado_por: item.criado_por || null,
    data_criacao: item.data_criacao || null,
    acesso_projetos: item.acesso_projetos ?? null,
    acesso_membros: item.acesso_membros ?? null,
    acesso_usuarios: item.acesso_usuarios ?? null,
    acesso_relatorios_projetos: item.acesso_relatorios_projetos ?? null,
    acesso_relatorios_elenco: item.acesso_relatorios_elenco ?? null,
    acesso_relatorios_membros: item.acesso_relatorios_membros ?? null,
    acesso_relatorios_entrada_saida:
      item.acesso_relatorios_entrada_saida ?? null,
    acesso_exportacoes: item.acesso_exportacoes ?? null,
    acesso_treinamentos: item.acesso_treinamentos ?? null,
  };
}

function mapProjetoDb(item: any, elenco: ElencoItem[]): Projeto {
  return {
    ID: String(item.id),
    Projeto: item.projeto || "",
    Tipo: item.tipo || "",
    Genero: item.genero || "",
    Prioridade: item.prioridade || "",
    Dupla: item.dupla || "",
    Lider: item.lider || "",
    Telefone_Lider: item.telefone_lider || "",
    Editor: item.editor || "",
    Telefone_Editor: item.telefone_editor || "",
    Status: item.status || "",
    Data_Inicio: item.data_inicio || "",
    Video_Editor_Link: item.video_editor_link || "",
    Registro_Semanal: item.registro_semanal || "",
    Observacoes: item.observacoes || "",
    Capa_URL: item.capa_url || "",
    Drive_Pasta_Link: item.drive_pasta_link || item.Drive_Pasta_Link || "",
    Drive_Videos_Link: item.drive_videos_link || item.Drive_Videos_Link || "",
    Drive_Cortes_Link: item.drive_cortes_link || item.Drive_Cortes_Link || "",
    Drive_Final_Link: item.drive_final_link || item.Drive_Final_Link || "",
    Arquivado: Boolean(item.arquivado),
    Elenco: elenco,
  };
}

function mapMembroDb(item: any): Membro {
  return {
    id: item.id,
    nome: item.nome || "",
    telefone: item.telefone || "",
    email: item.email || "",
    data_nascimento: item.data_nascimento || null,
    idade: item.idade ?? null,
    habilidades: item.habilidades || "",
    motivacao: item.motivacao || "",
    status: (item.status_comunidade ||
      item.status ||
      "na_comunidade") as StatusMembro,
    data_entrada: item.data_entrada || null,
    data_saida: item.data_saida || null,
    observacao: item.observacao || "",
  };
}

async function criarEstruturaDriveViaFunction(
  projetoNome: string
): Promise<DriveStructureResult | null> {
  const { data, error } = await supabase.functions.invoke(
    "google-drive-create-structure",
    {
      body: {
        projectName: projetoNome,
        folders: ["1 | Seleção", "2 | Projeto", "3 | Finalizado"],
      },
    }
  );

  if (error) {
    console.error("Erro ao chamar função do Google Drive:", error);
    return null;
  }

  return (data || null) as DriveStructureResult | null;
}

async function salvarRespostaTreinamentoBanco(
  resposta: RespostaTreinamento
): Promise<boolean> {
  const { error } = await supabase.from("treinamento_respostas").insert([
    {
      usuario_login: resposta.usuario_login,
      usuario_nome: resposta.usuario_nome,
      usuario_cargo: resposta.usuario_cargo,
      modulo_id: resposta.modulo_id,
      modulo_titulo: resposta.modulo_titulo,
      pergunta: resposta.pergunta,
      alternativa_marcada: resposta.alternativa_marcada,
      alternativa_texto: resposta.alternativa_texto,
      alternativa_correta: resposta.alternativa_correta,
      correta: resposta.correta,
      explicacao: resposta.explicacao,
    },
  ]);

  if (error) {
    console.error("Erro ao salvar resposta do treinamento:", error);
    return false;
  }

  return true;
}

async function carregarRespostasTreinamentoBanco(): Promise<
  RespostaTreinamento[]
> {
  const { data, error } = await supabase
    .from("treinamento_respostas")
    .select("*")
    .order("data_resposta", { ascending: false });

  if (error) {
    console.error("Erro ao buscar respostas do treinamento:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    usuario_login: item.usuario_login || "",
    usuario_nome: item.usuario_nome || "",
    usuario_cargo: item.usuario_cargo || "",
    modulo_id: item.modulo_id || "",
    modulo_titulo: item.modulo_titulo || "",
    pergunta: item.pergunta || "",
    alternativa_marcada: Number(item.alternativa_marcada ?? -1),
    alternativa_texto: item.alternativa_texto || "",
    alternativa_correta: Number(item.alternativa_correta ?? -1),
    correta: Boolean(item.correta),
    explicacao: item.explicacao || "",
    data_resposta: item.data_resposta || null,
  }));
}

async function carregarUsuariosBanco(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }

  return (data || []).map(mapUsuarioDb);
}

async function carregarMembrosBanco(): Promise<Membro[]> {
  const { data, error } = await supabase
    .from("membros")
    .select("*")
    .order("data_entrada", { ascending: false });

  if (error) {
    console.error("Erro ao buscar membros:", error);
    return [];
  }

  return (data || []).map(mapMembroDb);
}

async function atualizarStatusMembroBanco(
  membroId: number,
  status: StatusMembro,
  observacaoAtual?: string | null
): Promise<boolean> {
  const hoje = new Date().toISOString().slice(0, 10);
  const observacaoAutomatica =
    status === "na_comunidade"
      ? `Retornou/permanece na comunidade em ${formatarDataBR(hoje)}.`
      : `${statusMembroLabel(status)} em ${formatarDataBR(hoje)}.`;

  const observacaoFinal = [observacaoAtual || "", observacaoAutomatica]
    .filter(Boolean)
    .join("\n");

  const payload: any = {
    status_comunidade: status,
    observacao: observacaoFinal,
  };

  if (status === "na_comunidade") {
    payload.data_saida = null;
  } else {
    payload.data_saida = hoje;
  }

  const { error } = await supabase
    .from("membros")
    .update(payload)
    .eq("id", membroId);

  if (error) {
    console.error("Erro ao atualizar membro:", error);
    return false;
  }

  return true;
}

async function buscarPerfilPorEmail(email: string): Promise<Usuario | null> {
  const emailNormalizado = normalizar(email);

  if (!emailNormalizado) return null;

  const { data, error } = (await comTimeout(
    supabase
      .from("usuarios")
      .select("*")
      .eq("login", emailNormalizado)
      .maybeSingle(),
    15000,
    "A busca do perfil demorou demais."
  )) as any;

  if (error) {
    console.error("Perfil não encontrado:", error);
    return null;
  }

  if (!data) return null;

  return mapUsuarioDb(data);
}

async function carregarProjetosBanco(
  mostrarArquivados = false
): Promise<Projeto[]> {
  const { data: projetosDb, error: erroProjetos } = await supabase
    .from("projetos")
    .select("*")
    .eq("arquivado", mostrarArquivados)
    .order("id", { ascending: false });

  if (erroProjetos) {
    console.error("Erro ao buscar projetos:", erroProjetos);
    return [];
  }

  const { data: elencoDb, error: erroElenco } = await supabase
    .from("elenco")
    .select("*")
    .order("id", { ascending: true });

  if (erroElenco) {
    console.error("Erro ao buscar elenco:", erroElenco);
    return [];
  }

  const elencoPorProjeto = new Map<string, ElencoItem[]>();

  (elencoDb || []).forEach((item: any) => {
    const projetoId = String(item.projeto_id);
    if (!elencoPorProjeto.has(projetoId)) {
      elencoPorProjeto.set(projetoId, []);
    }

    elencoPorProjeto.get(projetoId)!.push({
      id: String(item.id),
      personagem: item.personagem || "",
      dublador: item.dublador || "",
      telefone_dublador: item.telefone_dublador || "",
      funcao: item.funcao || "",
    });
  });

  return (projetosDb || []).map((item: any) =>
    mapProjetoDb(item, elencoPorProjeto.get(String(item.id)) || [])
  );
}

async function criarProjetoBanco(projeto: Projeto): Promise<string | null> {
  const { data, error } = await supabase
    .from("projetos")
    .insert([
      {
        projeto: projeto.Projeto,
        tipo: projeto.Tipo,
        genero: projeto.Genero,
        prioridade: projeto.Prioridade,
        dupla: projeto.Dupla,
        lider: projeto.Lider,
        telefone_lider: projeto.Telefone_Lider,
        editor: projeto.Editor,
        telefone_editor: projeto.Telefone_Editor,
        status: projeto.Status,
        data_inicio: projeto.Data_Inicio,
        video_editor_link: projeto.Video_Editor_Link,
        registro_semanal: projeto.Registro_Semanal,
        observacoes: projeto.Observacoes || "",
        capa_url: projeto.Capa_URL,
        arquivado: projeto.Arquivado || false,
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao criar projeto:", error);
    return null;
  }

  return String(data.id);
}

async function atualizarProjetoBanco(projeto: Projeto): Promise<boolean> {
  const { error } = await supabase
    .from("projetos")
    .update({
      projeto: projeto.Projeto,
      tipo: projeto.Tipo,
      genero: projeto.Genero,
      prioridade: projeto.Prioridade,
      dupla: projeto.Dupla,
      lider: projeto.Lider,
      telefone_lider: projeto.Telefone_Lider,
      editor: projeto.Editor,
      telefone_editor: projeto.Telefone_Editor,
      status: projeto.Status,
      data_inicio: projeto.Data_Inicio,
      video_editor_link: projeto.Video_Editor_Link,
      registro_semanal: projeto.Registro_Semanal,
      observacoes: projeto.Observacoes || "",
      capa_url: projeto.Capa_URL,
      arquivado: projeto.Arquivado || false,
    })
    .eq("id", Number(projeto.ID));

  if (error) {
    console.error("Erro ao atualizar projeto:", error);
    return false;
  }

  return true;
}

async function atualizarArquivamentoProjetoBanco(
  projetoId: string,
  arquivado: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from("projetos")
    .update({ arquivado })
    .eq("id", Number(projetoId));

  if (error) {
    console.error("Erro ao alterar arquivamento:", error);
    return false;
  }

  return true;
}

async function salvarElencoProjetoBanco(
  projetoId: string,
  elenco: ElencoItem[]
): Promise<boolean> {
  const { error: erroDelete } = await supabase
    .from("elenco")
    .delete()
    .eq("projeto_id", Number(projetoId));

  if (erroDelete) {
    console.error("Erro ao limpar elenco:", erroDelete);
    return false;
  }

  if (!elenco.length) return true;

  const payload = elenco.map((item) => ({
    projeto_id: Number(projetoId),
    personagem: item.personagem,
    dublador: item.dublador,
    telefone_dublador: item.telefone_dublador || "",
    funcao: item.funcao || "",
  }));

  const { error: erroInsert } = await supabase.from("elenco").insert(payload);

  if (erroInsert) {
    console.error("Erro ao salvar elenco:", erroInsert);
    return false;
  }

  return true;
}

function gerarIdTemporario() {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function comTimeout<T>(
  promessa: PromiseLike<T>,
  ms = 15000,
  mensagem = "Tempo limite excedido"
): Promise<T> {
  return Promise.race([
    Promise.resolve(promessa),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(mensagem)), ms)
    ),
  ]);
}

function parseDataFlex(valor?: string | null): Date | null {
  if (!valor) return null;
  const texto = String(valor).trim();
  if (!texto) return null;

  const isoSimples = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoSimples) {
    const [, ano, mes, dia] = isoSimples;
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  }

  const dataIso = new Date(texto);
  if (!Number.isNaN(dataIso.getTime())) return dataIso;

  const partes = texto.split(/[\/\s:-]+/).map(Number);
  if (partes.length >= 3) {
    const [dia, mes, ano] = partes;
    if (dia && mes && ano) {
      const data = new Date(ano, mes - 1, dia);
      if (!Number.isNaN(data.getTime())) return data;
    }
  }

  return null;
}

function chaveMes(valor?: string | null): string {
  const data = parseDataFlex(valor);
  if (!data) return "";
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function formatarMesLabel(chave: string) {
  const [ano, mes] = chave.split("-").map(Number);
  if (!ano || !mes) return chave;
  const data = new Date(ano, mes - 1, 1);
  const nome = data.toLocaleDateString("pt-BR", { month: "long" });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} / ${ano}`;
}

function formatarDataBR(valor?: string | null) {
  const data = parseDataFlex(valor);
  if (!data) return "";
  return data.toLocaleDateString("pt-BR");
}

function gerarMesesEntre(inicio: string, fim: string) {
  const [anoInicio, mesInicio] = inicio.split("-").map(Number);
  const [anoFim, mesFim] = fim.split("-").map(Number);
  const meses: string[] = [];
  const data = new Date(anoInicio, mesInicio - 1, 1);
  const limite = new Date(anoFim, mesFim - 1, 1);

  while (data <= limite) {
    meses.push(
      `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`
    );
    data.setMonth(data.getMonth() + 1);
  }

  return meses;
}

function extrairLinksDrive(observacoes?: string) {
  const texto = observacoes || "";
  const inicio = texto.indexOf("[[DRIVE_LINKS]]");
  const fim = texto.indexOf("[[/DRIVE_LINKS]]");

  if (inicio === -1 || fim === -1) {
    return {
      pasta: "",
      selecao: "",
      projeto: "",
      videos: "",
      cortes: "",
      finalizados: "",
    };
  }

  try {
    const json = texto.slice(inicio + "[[DRIVE_LINKS]]".length, fim).trim();

    return {
      pasta: "",
      selecao: "",
      projeto: "",
      videos: "",
      cortes: "",
      finalizados: "",
      ...JSON.parse(json),
    };
  } catch {
    return {
      pasta: "",
      selecao: "",
      projeto: "",
      videos: "",
      cortes: "",
      finalizados: "",
    };
  }
}

function salvarLinksDriveEmObservacoes(observacoes: string, links: any) {
  const base = (observacoes || "")
    .replace(/\[\[DRIVE_LINKS\]\][\s\S]*?\[\[\/DRIVE_LINKS\]\]/g, "")
    .trim();

  const bloco = `[[DRIVE_LINKS]]
${JSON.stringify(links, null, 2)}
[[/DRIVE_LINKS]]`;

  return [base, bloco].filter(Boolean).join("\n\n");
}

function calcularRelatorioEntradaSaida(membros: Membro[]): RelatorioMes[] {
  const chaves = membros
    .flatMap((m) => [chaveMes(m.data_entrada), chaveMes(m.data_saida)])
    .filter(Boolean)
    .sort();

  if (!chaves.length) return [];

  const meses = gerarMesesEntre(chaves[0], chaves[chaves.length - 1]);
  let totalInicial = 0;

  return meses.map((mes) => {
    const entradas = membros.filter(
      (m) => chaveMes(m.data_entrada) === mes
    ).length;
    const saidas = membros.filter((m) => chaveMes(m.data_saida) === mes).length;
    const crescimento = entradas - saidas;
    const totalFinal = totalInicial + crescimento;

    const linha = {
      mes,
      mesLabel: formatarMesLabel(mes),
      totalInicial,
      entradas,
      saidas,
      crescimento,
      totalFinal,
    };

    totalInicial = totalFinal;
    return linha;
  });
}

export default function App() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [query, setQuery] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Projeto | null>(null);
  const [mostrarNovoProjeto, setMostrarNovoProjeto] = useState(false);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
  const [mostrarFormNovoUsuario, setMostrarFormNovoUsuario] = useState(false);
  const [mostrarMembros, setMostrarMembros] = useState(false);
  const [mostrarFerramentas, setMostrarFerramentas] = useState(false);
  const [categoriaFerramentas, setCategoriaFerramentas] = useState<
    "consultas" | "servicos" | "relatorios" | "financeiro"
  >("consultas");
  const [mostrarCentralAjuda, setMostrarCentralAjuda] = useState(false);
  const [mostrarRelatorios, setMostrarRelatorios] = useState(false);
  const [mostrarTreinamentos, setMostrarTreinamentos] = useState(false);
  const [moduloTreinamentoAtivo, setModuloTreinamentoAtivo] =
    useState("papel-lider");
  const [checklistTreinamento, setChecklistTreinamento] = useState<
    Record<string, boolean>
  >({});
  const [respostasTreinamento, setRespostasTreinamento] = useState<
    Record<string, number>
  >({});
  const [respostasTreinamentoSalvas, setRespostasTreinamentoSalvas] = useState<
    RespostaTreinamento[]
  >([]);
  const [carregandoRespostasTreinamento, setCarregandoRespostasTreinamento] =
    useState(false);
  const [mostrarResultadosTreinamento, setMostrarResultadosTreinamento] =
    useState(false);
  const [avaliacaoLider, setAvaliacaoLider] = useState({
    lider: "",
    projeto: "",
    nota: "10",
    status: "em_treinamento",
    observacoes: "",
  });
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [queryMembros, setQueryMembros] = useState("");
  const [membroSelecionadoId, setMembroSelecionadoId] = useState<number | null>(
    null
  );
  const [registroSemanalTexto, setRegistroSemanalTexto] = useState("");
  const [abaProjeto, setAbaProjeto] = useState<
    | "informacoes"
    | "elenco"
    | "registros"
    | "drive"
    | "atividades"
    | "historico"
  >("informacoes");
  const [carregando, setCarregando] = useState(true);
  const [carregandoLogin, setCarregandoLogin] = useState(false);
  const [larguraTela, setLarguraTela] = useState(
    typeof window === "undefined" ? 1200 : window.innerWidth
  );

  const isMobile = larguraTela <= 768;
  const isTablet = larguraTela <= 1100;

  const [novoProjeto, setNovoProjeto] = useState<Projeto>(projetoVazio);
  const [novoUsuario, setNovoUsuario] = useState<Usuario>({
    nome: "",
    login: "",
    senha: "",
    cargo: "lider",
    vinculo: "",
    training_status: "nao_aplicavel",
    ...permissoesPadraoUsuario("lider"),
  });
  const [novoElencoProjeto, setNovoElencoProjeto] =
    useState<ElencoItem>(elencoVazio);
  const [novoElencoRascunho, setNovoElencoRascunho] =
    useState<ElencoItem>(elencoVazio);
  const [criandoEstruturaDrive, setCriandoEstruturaDrive] = useState(false);

  useEffect(() => {
    function atualizarLargura() {
      setLarguraTela(window.innerWidth);
    }

    atualizarLargura();
    window.addEventListener("resize", atualizarLargura);
    return () => window.removeEventListener("resize", atualizarLargura);
  }, []);

  async function recarregarProjetos() {
    try {
      setCarregando(true);
      const lista = await comTimeout(
        carregarProjetosBanco(mostrarArquivados),
        20000,
        "A busca dos projetos demorou demais."
      );
      setProjetos(lista);
    } catch (err) {
      console.error("Erro ao recarregar projetos:", err);
    } finally {
      setCarregando(false);
    }
  }

  async function recarregarUsuarios() {
    try {
      const lista = await comTimeout(
        carregarUsuariosBanco(),
        20000,
        "A busca dos usuários demorou demais."
      );
      setUsuarios(lista);
    } catch (err) {
      console.error("Erro ao recarregar usuários:", err);
    }
  }

  async function recarregarMembros() {
    if (!podeGerenciarMembros(usuarioLogado)) return;

    try {
      const lista = await comTimeout(
        carregarMembrosBanco(),
        20000,
        "A busca dos membros demorou demais."
      );
      setMembros(lista);
    } catch (err) {
      console.error("Erro ao recarregar membros:", err);
    }
  }

  useEffect(() => {
    async function restaurarSessaoERecarregar() {
      try {
        const usuarioSalvo = localStorage.getItem("dubworks_usuario");
        if (usuarioSalvo && !usuarioLogado) {
          try {
            setUsuarioLogado(JSON.parse(usuarioSalvo));
          } catch {
            localStorage.removeItem("dubworks_usuario");
          }
        }

        await recarregarProjetos();
        await recarregarUsuarios();

        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email?.trim().toLowerCase();

        if (!email) {
          return;
        }

        const perfil = await buscarPerfilPorEmail(email);
        if (perfil) {
          setUsuarioLogado(perfil);
          localStorage.setItem("dubworks_usuario", JSON.stringify(perfil));
          if (podeGerenciarMembros(perfil)) {
            carregarMembrosBanco()
              .then(setMembros)
              .catch((err) => console.error("Erro ao carregar membros:", err));
          }
        }
      } catch (err) {
        console.error("Erro ao restaurar sessão:", err);
      }
    }

    restaurarSessaoERecarregar();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        const email = session?.user?.email?.trim().toLowerCase();

        if (!email) {
          return;
        }

        const perfil = await buscarPerfilPorEmail(email);
        if (perfil) {
          setUsuarioLogado(perfil);
          localStorage.setItem("dubworks_usuario", JSON.stringify(perfil));
          if (podeGerenciarMembros(perfil)) {
            carregarMembrosBanco()
              .then(setMembros)
              .catch((err) => console.error("Erro ao carregar membros:", err));
          }
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [mostrarArquivados]);

  useEffect(() => {
    if (!mostrarNovoProjeto || !usuarioLogado) return;

    if (
      usuarioLogado.cargo === "lider" ||
      usuarioLogado.cargo === "lider_treinamento"
    ) {
      setNovoProjeto((anterior) => ({
        ...anterior,
        Lider: usuarioLogado.vinculo || usuarioLogado.nome,
      }));
    }
  }, [mostrarNovoProjeto, usuarioLogado]);

  useEffect(() => {
    const permitidos = cargosPermitidosParaCriar(usuarioLogado);
    if (!permitidos.length) return;
    if (permitidos.indexOf(novoUsuario.cargo) === -1) {
      setNovoUsuario((anterior) => ({
        ...anterior,
        cargo: permitidos[0],
        training_status: statusPadraoPorCargo(permitidos[0]),
        ...permissoesPadraoUsuario(permitidos[0]),
      }));
    }
  }, [usuarioLogado, novoUsuario.cargo]);

  const projetosVisiveis = useMemo(() => {
    if (!usuarioLogado) return [];
    return projetos.filter((p) => podeVerProjeto(usuarioLogado, p));
  }, [projetos, usuarioLogado]);

  const statusUnicos = useMemo(() => {
    return Array.from(
      new Set(projetosVisiveis.map((p) => p.Status).filter(Boolean))
    );
  }, [projetosVisiveis]);

  const filtrados = useMemo(() => {
    return projetosVisiveis.filter((p) => {
      const termo = query.toLowerCase();
      const camposBusca = [
        p.ID,
        p.Projeto,
        p.Tipo,
        p.Genero,
        p.Prioridade,
        p.Status,
        p.Lider,
        p.Editor,
        p.Dupla,
        ...p.Elenco.map(
          (item) => `${item.personagem} ${item.dublador} ${item.funcao}`
        ),
      ]
        .join(" ")
        .toLowerCase();

      const busca = camposBusca.indexOf(termo) !== -1;
      const statusOk = statusFiltro === "Todos" || p.Status === statusFiltro;
      return busca && statusOk;
    });
  }, [projetosVisiveis, query, statusFiltro]);

  const selecionado = useMemo(() => {
    return projetos.find((p) => p.ID === selecionadoId) || null;
  }, [projetos, selecionadoId]);

  useEffect(() => {
    if (selecionado) {
      setRascunho({ ...selecionado, Elenco: [...selecionado.Elenco] });
    } else {
      setRascunho(null);
    }
  }, [selecionado]);

  const rankingDubladores = useMemo(() => {
    const mapa = new Map<
      string,
      {
        nome: string;
        totalProjetos: number;
        totalPapeis: number;
        projetosUnicos: Set<string>;
      }
    >();

    projetos.forEach((projeto) => {
      projeto.Elenco.forEach((item) => {
        const chave = normalizar(item.dublador);
        if (!chave) return;
        if (!mapa.has(chave)) {
          mapa.set(chave, {
            nome: item.dublador,
            totalProjetos: 0,
            totalPapeis: 0,
            projetosUnicos: new Set<string>(),
          });
        }
        const registro = mapa.get(chave)!;
        registro.totalPapeis += 1;
        registro.projetosUnicos.add(projeto.ID);
      });
    });

    return Array.from(mapa.values())
      .map((item) => ({
        nome: item.nome,
        totalProjetos: item.projetosUnicos.size,
        totalPapeis: item.totalPapeis,
      }))
      .sort((a, b) => {
        if (b.totalProjetos !== a.totalProjetos)
          return b.totalProjetos - a.totalProjetos;
        return b.totalPapeis - a.totalPapeis;
      });
  }, [projetos]);

  const usuariosVisiveis = useMemo(() => {
    if (!usuarioLogado) return [];
    if (usuarioLogado.cargo === "diretoria") return usuarios;
    if (usuarioLogado.cargo === "adm") {
      return usuarios.filter((u) => u.cargo !== "diretoria");
    }
    if (usuarioLogado.cargo === "adm_treinamento") {
      return usuarios.filter((u) => u.cargo === "lider_treinamento");
    }
    return [];
  }, [usuarios, usuarioLogado]);

  const membrosFiltrados = useMemo(() => {
    const termo = normalizar(queryMembros);
    if (!termo) return membros;

    const statusDireto: Record<string, StatusMembro> = {
      "na comunidade": "na_comunidade",
      ativo: "na_comunidade",
      ativos: "na_comunidade",
      saiu: "saiu",
      sairam: "saiu",
      saíram: "saiu",
      banido: "banido",
      banidos: "banido",
      pausado: "pausado",
      pausados: "pausado",
    };

    if (statusDireto[termo]) {
      return membros.filter((m) => m.status === statusDireto[termo]);
    }

    return membros.filter((m) =>
      [
        m.nome,
        m.telefone,
        m.email,
        m.habilidades || "",
        m.motivacao || "",
        m.observacao || "",
        statusMembroLabel(m.status),
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [membros, queryMembros]);

  const relatorioEntradaSaida = useMemo(() => {
    return calcularRelatorioEntradaSaida(membros);
  }, [membros]);

  const totalMembrosAtivos = membros.filter(
    (m) => m.status === "na_comunidade"
  ).length;
  const totalMembrosSaida = membros.filter((m) => m.status === "saiu").length;

  const totalProjetos = projetosVisiveis.length;
  const totalAtivos = projetosVisiveis.filter(
    (p) =>
      ["finalizado", "concluida", "concluído"].indexOf(normalizar(p.Status)) ===
      -1
  ).length;
  const totalFinalizados = projetosVisiveis.filter(
    (p) =>
      ["finalizado", "concluida", "concluído"].indexOf(normalizar(p.Status)) !==
      -1
  ).length;
  const totalElenco = projetosVisiveis.reduce(
    (acc, projeto) => acc + projeto.Elenco.length,
    0
  );
  const totalTreinamento = usuarios.filter(
    (u) => u.cargo === "lider_treinamento"
  ).length;

  const moduloSelecionadoTreinamento =
    modulosTreinamentoLider.find((m) => m.id === moduloTreinamentoAtivo) ||
    modulosTreinamentoLider[0];

  const totalPerguntasTreinamento = modulosTreinamentoLider.filter(
    (modulo) => modulo.pergunta
  ).length;

  const respostasCorretasTreinamento = modulosTreinamentoLider.filter(
    (modulo) =>
      modulo.pergunta &&
      respostasTreinamento[modulo.id] === modulo.pergunta.correta
  ).length;

  const progressoTreinamento = totalPerguntasTreinamento
    ? Math.round(
        (respostasCorretasTreinamento / totalPerguntasTreinamento) * 100
      )
    : 0;

  function responderPerguntaTreinamento(
    moduloId: string,
    alternativaIndex: number
  ) {
    setRespostasTreinamento((atual) => ({
      ...atual,
      [moduloId]: alternativaIndex,
    }));
  }

  async function recarregarRespostasTreinamento() {
    if (!usuarioLogado) return;
    if (!podeGerenciarTreinamentos(usuarioLogado)) return;

    try {
      setCarregandoRespostasTreinamento(true);
      const lista = await carregarRespostasTreinamentoBanco();
      setRespostasTreinamentoSalvas(lista);
    } catch (err) {
      console.error("Erro ao carregar respostas do treinamento:", err);
    } finally {
      setCarregandoRespostasTreinamento(false);
    }
  }

  async function enviarRespostaTreinamento(modulo: ModuloTreinamento) {
    if (!usuarioLogado || !modulo.pergunta) return;

    const alternativaMarcada = respostasTreinamento[modulo.id];

    if (alternativaMarcada === undefined) {
      alert("Escolha uma alternativa antes de enviar.");
      return;
    }

    const resposta: RespostaTreinamento = {
      usuario_login: usuarioLogado.login,
      usuario_nome: usuarioLogado.nome,
      usuario_cargo: usuarioLogado.cargo,
      modulo_id: modulo.id,
      modulo_titulo: modulo.titulo,
      pergunta: modulo.pergunta.pergunta,
      alternativa_marcada: alternativaMarcada,
      alternativa_texto: modulo.pergunta.alternativas[alternativaMarcada] || "",
      alternativa_correta: modulo.pergunta.correta,
      correta: alternativaMarcada === modulo.pergunta.correta,
      explicacao: modulo.pergunta.explicacao,
    };

    const ok = await salvarRespostaTreinamentoBanco(resposta);

    if (!ok) {
      alert(
        "Não consegui salvar a resposta. Confira se a tabela treinamento_respostas existe no Supabase."
      );
      return;
    }

    alert("Resposta enviada para avaliação da diretoria.");
    await recarregarRespostasTreinamento();
  }

  async function fazerLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setCarregandoLogin(true);
      setErroLogin("");

      const email = login.trim().toLowerCase();

      if (!email || !senha) {
        setErroLogin("Digite seu e-mail e sua senha.");
        return;
      }

      const { data, error } = (await comTimeout(
        supabase.auth.signInWithPassword({
          email,
          password: senha,
        }),
        20000,
        "O login demorou demais para responder."
      )) as any;

      if (error || !data.user?.email) {
        console.error("Erro no login:", error);
        setErroLogin("Login ou senha inválidos.");
        return;
      }

      const perfil = await buscarPerfilPorEmail(data.user.email);

      if (!perfil) {
        await supabase.auth.signOut();
        setErroLogin(
          "Login autorizado, mas esse e-mail ainda não tem perfil na tabela usuarios. Confira o cadastro no Supabase."
        );
        return;
      }

      setUsuarioLogado(perfil);
      localStorage.setItem("dubworks_usuario", JSON.stringify(perfil));
      setErroLogin("");
      setSelecionadoId(null);

      // Recarrega os dados depois de liberar a entrada.
      // Assim o botão não fica preso em "Entrando..." se alguma consulta demorar.
      setTimeout(() => {
        recarregarProjetos();
        recarregarUsuarios();
        if (podeGerenciarMembros(perfil)) {
          carregarMembrosBanco()
            .then(setMembros)
            .catch((err) => console.error("Erro ao carregar membros:", err));
        }
      }, 0);
    } catch (err: any) {
      console.error("Erro inesperado no login:", err);
      setErroLogin(
        err?.message || "Erro de conexão com o servidor. Tente novamente."
      );
    } finally {
      setCarregandoLogin(false);
    }
  }

  async function enviarRecuperacaoSenha() {
    const email = login.trim().toLowerCase();

    if (!email) {
      setErroLogin("Digite seu e-mail no campo de login primeiro.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://dubworks-manager-teste.vercel.app/",
    });

    if (error) {
      console.error("Erro ao enviar recuperação de senha:", error);
      setErroLogin(
        "Não consegui enviar o e-mail de recuperação. Confira o e-mail e tente novamente."
      );
      return;
    }

    setErroLogin("Enviamos um link de recuperação para o seu e-mail.");
  }

  async function sair() {
    await supabase.auth.signOut();
    localStorage.removeItem("dubworks_usuario");
    setUsuarioLogado(null);
    setLogin("");
    setSenha("");
    setErroLogin("");
    setSelecionadoId(null);
    setRascunho(null);
  }

  function atualizarCampo(campo: keyof Projeto, valor: string) {
    if (!rascunho) return;
    setRascunho({ ...rascunho, [campo]: valor });
  }

  function limparFormularioProjeto() {
    setNovoProjeto({
      ...projetoVazio,
      Lider:
        usuarioLogado &&
        (usuarioLogado.cargo === "lider" ||
          usuarioLogado.cargo === "lider_treinamento")
          ? usuarioLogado.vinculo || usuarioLogado.nome
          : "",
    });
    setNovoElencoProjeto(elencoVazio);
  }

  async function criarProjeto() {
    if (!usuarioLogado || !podeCriarProjeto(usuarioLogado)) return;

    if (!novoProjeto.Projeto.trim()) {
      alert("Preencha pelo menos o nome do projeto.");
      return;
    }

    const projetoParaSalvar: Projeto = {
      ...novoProjeto,
      Lider:
        usuarioLogado.cargo === "lider" ||
        usuarioLogado.cargo === "lider_treinamento"
          ? usuarioLogado.vinculo || usuarioLogado.nome
          : novoProjeto.Lider,
    };

    const projetoParaSalvarComHistorico: Projeto = {
      ...projetoParaSalvar,
      Registro_Semanal: [
        projetoParaSalvar.Registro_Semanal || "",
        `[${new Date().toLocaleString("pt-BR")}] ${
          usuarioLogado.nome
        }: Criou o projeto.`,
      ]
        .filter(Boolean)
        .join("\n"),
    };

    const projetoId = await criarProjetoBanco(projetoParaSalvarComHistorico);
    if (!projetoId) {
      alert("Erro ao salvar no banco.");
      return;
    }

    const elencoOk = await salvarElencoProjetoBanco(
      projetoId,
      projetoParaSalvarComHistorico.Elenco
    );

    if (!elencoOk) alert("Projeto salvo, mas houve erro ao salvar o elenco.");

    await recarregarProjetos();
    setMostrarNovoProjeto(false);
    limparFormularioProjeto();
    setSelecionadoId(projetoId);
    alert("Projeto salvo no banco 🚀");
  }

  function registrarHistoricoProjeto(texto: string) {
    if (!rascunho) return;

    const agora = new Date().toLocaleString("pt-BR");
    const autor = usuarioLogado?.nome || "Sistema";
    const linha = `[${agora}] ${autor}: ${texto}`;

    setRascunho({
      ...rascunho,
      Registro_Semanal: [rascunho.Registro_Semanal || "", linha]
        .filter(Boolean)
        .join("\n"),
    });
  }

  async function criarEstruturaDriveProjeto() {
    if (!rascunho || !projetoPainel) return;

    if (!podeEditarProjeto(usuarioLogado, projetoPainel)) {
      alert("Você não tem permissão para criar pastas neste projeto.");
      return;
    }

    const linksAtuais = extrairLinksDrive(rascunho.Observacoes);

    if (
      linksAtuais.pasta ||
      linksAtuais.selecao ||
      linksAtuais.projeto ||
      linksAtuais.finalizados
    ) {
      const confirmar = window.confirm(
        "Este projeto já possui links do Drive cadastrados. Deseja continuar mesmo assim?"
      );

      if (!confirmar) return;
    }

    try {
      setCriandoEstruturaDrive(true);

      const resultado = await criarEstruturaDriveViaFunction(
        `[Projeto] ${rascunho.Projeto || projetoPainel.Projeto || "Sem nome"}`
      );

      if (!resultado) {
        alert(
          "A estrutura ainda não foi criada porque a função google-drive-create-structure não está configurada no Supabase. Deixei o botão pronto nesta branch para ligarmos a API do Google Drive na próxima etapa."
        );
        return;
      }

      const novosLinks = {
        ...linksAtuais,
        pasta: resultado.pasta || linksAtuais.pasta || "",
        selecao: resultado.selecao || linksAtuais.selecao || "",
        projeto: resultado.projeto || linksAtuais.projeto || "",
        finalizados: resultado.finalizados || linksAtuais.finalizados || "",
      };

      const projetoComLinks: Projeto = {
        ...rascunho,
        Observacoes: salvarLinksDriveEmObservacoes(
          rascunho.Observacoes,
          novosLinks
        ),
      };

      const projetoComHistorico = aplicarHistoricoAutomatico(
        projetoPainel,
        projetoComLinks,
        "criou estrutura oficial no Google Drive"
      );

      const ok = await atualizarProjetoBanco(projetoComHistorico);

      if (!ok) {
        alert(
          "A estrutura foi criada, mas houve erro ao salvar os links no banco."
        );
        return;
      }

      setRascunho(projetoComHistorico);
      await recarregarProjetos();
      alert("Estrutura do Drive criada e links salvos no projeto.");
    } catch (err) {
      console.error("Erro ao criar estrutura no Drive:", err);
      alert("Erro ao criar estrutura no Drive. Veja o console para detalhes.");
    } finally {
      setCriandoEstruturaDrive(false);
    }
  }

  async function salvarLinksDriveComHistorico() {
    if (!rascunho || !projetoPainel) return;

    const linksAtuais = extrairLinksDrive(rascunho.Observacoes);
    const linksAntigos = extrairLinksDrive(projetoPainel.Observacoes);

    const alterados: string[] = [];

    if ((linksAtuais.pasta || "") !== (linksAntigos.pasta || "")) {
      alterados.push("Pasta Principal");
    }

    if (
      (linksAtuais.selecao || linksAtuais.videos || "") !==
      (linksAntigos.selecao || linksAntigos.videos || "")
    ) {
      alterados.push("1 | Seleção");
    }

    if (
      (linksAtuais.projeto || linksAtuais.cortes || "") !==
      (linksAntigos.projeto || linksAntigos.cortes || "")
    ) {
      alterados.push("2 | Projeto");
    }

    if ((linksAtuais.finalizados || "") !== (linksAntigos.finalizados || "")) {
      alterados.push("Finalizados");
    }

    if (alterados.length) {
      const agora = new Date().toLocaleString("pt-BR");
      const autor = usuarioLogado?.nome || "Sistema";
      const linha = `[${agora}] ${autor}: Atualizou links do Drive (${alterados.join(
        ", "
      )}).`;

      const projetoComHistorico: Projeto = aplicarHistoricoAutomatico(
        projetoPainel,
        rascunho,
        `atualizou links do Drive (${alterados.join(", ")})`
      );

      setRascunho(projetoComHistorico);

      const ok = await atualizarProjetoBanco(projetoComHistorico);

      if (!ok) {
        alert("Erro ao salvar os links no banco.");
        return;
      }

      await recarregarProjetos();
      alert("Links salvos e histórico registrado.");
      return;
    }

    await salvarAlteracoes();
  }

  function descreverAlteracoesProjeto(antes: Projeto, depois: Projeto) {
    const alteracoes: string[] = [];

    const campos: { chave: keyof Projeto; label: string }[] = [
      { chave: "Projeto", label: "nome do projeto" },
      { chave: "Tipo", label: "tipo" },
      { chave: "Genero", label: "gênero" },
      { chave: "Prioridade", label: "prioridade" },
      { chave: "Dupla", label: "dupla" },
      { chave: "Lider", label: "líder" },
      { chave: "Telefone_Lider", label: "telefone do líder" },
      { chave: "Editor", label: "editor" },
      { chave: "Telefone_Editor", label: "telefone do editor" },
      { chave: "Status", label: "status" },
      { chave: "Data_Inicio", label: "data de início" },
      { chave: "Video_Editor_Link", label: "link do vídeo do editor" },
      { chave: "Capa_URL", label: "capa do projeto" },
      { chave: "Observacoes", label: "observações/links do Drive" },
    ];

    campos.forEach((campo) => {
      const valorAntes = String((antes as any)[campo.chave] || "").trim();
      const valorDepois = String((depois as any)[campo.chave] || "").trim();

      if (valorAntes !== valorDepois) {
        alteracoes.push(campo.label);
      }
    });

    const elencoAntes = (antes.Elenco || [])
      .map(
        (item) =>
          `${item.personagem}|${item.dublador}|${
            item.telefone_dublador || ""
          }|${item.funcao}`
      )
      .join(";;");

    const elencoDepois = (depois.Elenco || [])
      .map(
        (item) =>
          `${item.personagem}|${item.dublador}|${
            item.telefone_dublador || ""
          }|${item.funcao}`
      )
      .join(";;");

    if (elencoAntes !== elencoDepois) {
      alteracoes.push("elenco");
    }

    return alteracoes;
  }

  function aplicarHistoricoAutomatico(
    projetoAntes: Projeto,
    projetoDepois: Projeto,
    acaoManual?: string
  ) {
    const alteracoes = acaoManual
      ? [acaoManual]
      : descreverAlteracoesProjeto(projetoAntes, projetoDepois);

    if (!alteracoes.length) return projetoDepois;

    const agora = new Date().toLocaleString("pt-BR");
    const autor = usuarioLogado?.nome || "Sistema";
    const linha = `[${agora}] ${autor}: Atualizou ${alteracoes.join(", ")}.`;

    return {
      ...projetoDepois,
      Registro_Semanal: [projetoDepois.Registro_Semanal || "", linha]
        .filter(Boolean)
        .join("\n"),
    };
  }

  async function salvarAlteracoes() {
    if (!rascunho || !selecionado || !usuarioLogado) return;

    const podeEditar = podeEditarProjeto(usuarioLogado, selecionado);
    const podeVideo = podeSubirVideoEditor(usuarioLogado, selecionado);
    if (!podeEditar && !podeVideo) return;

    if (!podeEditar && podeVideo) {
      const projetoVideoBase: Projeto = {
        ...selecionado,
        Video_Editor_Link: rascunho.Video_Editor_Link || "",
        Observacoes: rascunho.Observacoes || "",
      };

      const projetoVideo = aplicarHistoricoAutomatico(
        selecionado,
        projetoVideoBase
      );

      const ok = await atualizarProjetoBanco(projetoVideo);
      if (!ok) {
        alert("Erro ao salvar no banco.");
        return;
      }

      await recarregarProjetos();
      alert("Alterações salvas com sucesso.");
      return;
    }

    const projetoFinal: Projeto = {
      ...rascunho,
      Lider:
        usuarioLogado.cargo === "lider" ||
        usuarioLogado.cargo === "lider_treinamento"
          ? usuarioLogado.vinculo || usuarioLogado.nome
          : rascunho.Lider,
    };

    const projetoFinalComHistorico = aplicarHistoricoAutomatico(
      selecionado,
      projetoFinal
    );

    const projetoOk = await atualizarProjetoBanco(projetoFinalComHistorico);
    if (!projetoOk) {
      alert("Erro ao salvar o projeto no banco.");
      return;
    }

    const elencoOk = await salvarElencoProjetoBanco(
      projetoFinalComHistorico.ID,
      projetoFinalComHistorico.Elenco.filter(
        (item) => item.personagem.trim() || item.dublador.trim()
      )
    );
    if (!elencoOk) {
      alert("Projeto salvo, mas houve erro ao salvar o elenco.");
      return;
    }

    await recarregarProjetos();
    alert("Alterações salvas com sucesso.");
  }

  async function salvarElencoAtual() {
    if (!rascunho || !selecionado || !usuarioLogado) return;

    if (!podeEditarProjeto(usuarioLogado, selecionado)) {
      alert("Você não tem permissão para alterar o elenco deste projeto.");
      return;
    }

    const elencoFiltrado = (rascunho.Elenco || []).filter(
      (item) => item.personagem.trim() || item.dublador.trim()
    );

    const projetoComElenco: Projeto = {
      ...rascunho,
      Elenco: elencoFiltrado,
    };

    const projetoComHistorico = aplicarHistoricoAutomatico(
      selecionado,
      projetoComElenco,
      "atualizou o elenco"
    );

    const projetoOk = await atualizarProjetoBanco(projetoComHistorico);

    if (!projetoOk) {
      alert("Erro ao salvar o projeto no banco.");
      return;
    }

    const elencoOk = await salvarElencoProjetoBanco(
      projetoComHistorico.ID,
      projetoComHistorico.Elenco
    );

    if (!elencoOk) {
      alert("Projeto salvo, mas houve erro ao salvar o elenco.");
      return;
    }

    setRascunho(projetoComHistorico);
    await recarregarProjetos();
    alert("Elenco salvo com sucesso.");
  }

  async function criarUsuario() {
    if (!usuarioLogado || !podeGerenciarUsuarios(usuarioLogado)) return;

    const permitidos = cargosPermitidosParaCriar(usuarioLogado);
    if (permitidos.indexOf(novoUsuario.cargo) === -1) {
      alert("Você não tem permissão para criar esse tipo de usuário.");
      return;
    }

    if (!novoUsuario.nome.trim() || !novoUsuario.login.trim()) {
      alert("Preencha nome e e-mail/login.");
      return;
    }

    const email = novoUsuario.login.trim().toLowerCase();
    if (usuarios.some((u) => normalizar(u.login) === email)) {
      alert("Já existe um perfil com esse login.");
      return;
    }

    const payload = {
      nome: novoUsuario.nome.trim(),
      login: email,
      cargo: novoUsuario.cargo,
      vinculo: novoUsuario.vinculo.trim(),
      training_status:
        novoUsuario.cargo === "lider_treinamento"
          ? novoUsuario.training_status || "em_andamento"
          : "nao_aplicavel",
      criado_por: usuarioLogado.login,
      ...permissoesDisponiveis.reduce((acc, item) => {
        acc[item.chave] = Boolean(novoUsuario[item.chave]);
        return acc;
      }, {} as Record<ChavePermissao, boolean>),
    };

    const { error } = await supabase.from("usuarios").insert([payload]);

    if (error) {
      console.error("Erro ao criar perfil:", error);
      alert("Erro ao criar perfil na tabela usuarios.");
      return;
    }

    await recarregarUsuarios();
    const cargoInicial = permitidos[0] || "lider";
    setNovoUsuario({
      nome: "",
      login: "",
      senha: "",
      cargo: cargoInicial,
      vinculo: "",
      training_status: statusPadraoPorCargo(cargoInicial),
      ...permissoesPadraoUsuario(cargoInicial),
    });

    alert(
      "Perfil criado com sucesso. Lembre-se: o login real também precisa existir em Authentication > Users."
    );
  }

  async function excluirUsuario(alvo: Usuario) {
    if (!usuarioLogado || !podeExcluirUsuario(usuarioLogado, alvo)) {
      alert("Você não tem permissão para excluir esse usuário.");
      return;
    }

    if (normalizar(alvo.login) === normalizar(usuarioLogado.login)) {
      alert("Você não pode excluir o próprio usuário logado.");
      return;
    }

    const confirmar = confirm(`Excluir o perfil de ${alvo.nome}?`);
    if (!confirmar) return;

    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", alvo.id);

    if (error) {
      console.error("Erro ao excluir perfil:", error);
      alert("Erro ao excluir perfil.");
      return;
    }

    await recarregarUsuarios();
  }

  async function atualizarTrainingStatus(
    alvo: Usuario,
    status: TrainingStatus
  ) {
    if (!usuarioLogado || !podeGerenciarTreinamentos(usuarioLogado)) return;
    if (
      usuarioLogado.cargo === "adm_treinamento" &&
      alvo.cargo !== "lider_treinamento"
    ) {
      alert("ADM treinamento só pode alterar líderes em treinamento.");
      return;
    }

    const { error } = await supabase
      .from("usuarios")
      .update({ training_status: status })
      .eq("id", alvo.id);

    if (error) {
      console.error("Erro ao atualizar treinamento:", error);
      alert("Erro ao atualizar status de treinamento.");
      return;
    }

    await recarregarUsuarios();
  }

  async function concluirTreinamento(alvo: Usuario) {
    if (!usuarioLogado || !podeGerenciarTreinamentos(usuarioLogado)) return;

    const { error } = await supabase
      .from("usuarios")
      .update({ cargo: "lider", training_status: "concluido" })
      .eq("id", alvo.id);

    if (error) {
      console.error("Erro ao concluir treinamento:", error);
      alert("Erro ao concluir treinamento.");
      return;
    }

    await recarregarUsuarios();
    alert("Treinamento concluído e usuário alterado para líder.");
  }

  async function alterarArquivamentoProjeto(arquivado: boolean) {
    if (!usuarioLogado || usuarioLogado.cargo !== "diretoria" || !selecionado)
      return;

    const acao = arquivado ? "arquivar" : "reativar";
    const confirmar = confirm(`Tem certeza que deseja ${acao} este projeto?`);
    if (!confirmar) return;

    const projetoComHistoricoArquivamento: Projeto = aplicarHistoricoAutomatico(
      selecionado,
      { ...selecionado, Arquivado: arquivado },
      arquivado ? "arquivou o projeto" : "reativou o projeto"
    );

    await atualizarProjetoBanco(projetoComHistoricoArquivamento);

    const ok = await atualizarArquivamentoProjetoBanco(
      selecionado.ID,
      arquivado
    );
    if (!ok) {
      alert("Não consegui alterar o status de arquivamento do projeto.");
      return;
    }

    setSelecionadoId(null);
    setRascunho(null);
    await recarregarProjetos();
    alert(arquivado ? "Projeto arquivado." : "Projeto reativado.");
  }

  function adicionarElencoNovoProjeto() {
    if (
      !novoElencoProjeto.personagem.trim() ||
      !novoElencoProjeto.dublador.trim()
    ) {
      alert("Preencha personagem e dublador.");
      return;
    }

    setNovoProjeto((anterior) => ({
      ...anterior,
      Elenco: [
        ...anterior.Elenco,
        { ...novoElencoProjeto, id: gerarIdTemporario() },
      ],
    }));

    setNovoElencoProjeto(elencoVazio);
  }

  function removerElencoNovoProjeto(id: string) {
    setNovoProjeto((anterior) => ({
      ...anterior,
      Elenco: anterior.Elenco.filter((item) => item.id !== id),
    }));
  }

  function removerElencoRascunho(id: string) {
    if (!rascunho) return;
    setRascunho({
      ...rascunho,
      Elenco: rascunho.Elenco.filter((item) => item.id !== id),
    });
  }

  function adicionarElencoRascunho() {
    if (!rascunho) return;

    const novoItem: ElencoItem = {
      id: `novo-${Date.now()}`,
      personagem: "",
      dublador: "",
      funcao: "",
    };

    setRascunho({
      ...rascunho,
      Elenco: [...(rascunho.Elenco || []), novoItem],
    });
  }

  function atualizarElencoRascunho(
    index: number,
    campo: keyof ElencoItem,
    valor: string
  ) {
    if (!rascunho) return;

    const novoElenco = [...(rascunho.Elenco || [])];
    novoElenco[index] = {
      ...novoElenco[index],
      [campo]: valor,
    };

    setRascunho({
      ...rascunho,
      Elenco: novoElenco,
    });
  }

  async function excluirElencoRascunho(item: ElencoItem, index: number) {
    if (!rascunho) return;

    const confirmar = confirm(
      `Remover ${item.personagem || "este personagem"} do elenco?`
    );
    if (!confirmar) return;

    const novoElenco = rascunho.Elenco.filter((_, i) => i !== index);

    setRascunho({
      ...rascunho,
      Elenco: novoElenco,
    });

    const idNumerico = Number(item.id);

    if (item.id && !Number.isNaN(idNumerico)) {
      const { error } = await supabase
        .from("elenco")
        .delete()
        .eq("id", idNumerico);

      if (error) {
        console.error("Erro ao excluir elenco:", error);
        alert(
          "Não consegui excluir no banco. Clique em Atualizar para tentar salvar a alteração."
        );
        return;
      }

      await recarregarProjetos();
    }
  }

  async function atualizarPermissaoUsuario(
    alvo: Usuario,
    chave: ChavePermissao,
    valor: boolean
  ) {
    if (!alvo.id || !podeGerenciarUsuarios(usuarioLogado)) return;

    if (alvo.cargo === "diretoria" && usuarioLogado?.cargo !== "diretoria") {
      alert("Somente diretoria pode alterar permissões de outra diretoria.");
      return;
    }

    const { error } = await supabase
      .from("usuarios")
      .update({ [chave]: valor })
      .eq("id", alvo.id);

    if (error) {
      console.error("Erro ao atualizar permissão:", error);
      alert("Não consegui atualizar a permissão.");
      return;
    }

    setUsuarios((lista) =>
      lista.map((u) => (u.id === alvo.id ? { ...u, [chave]: valor } : u))
    );
  }

  function abrirTelaTreinamentos() {
    setMostrarTreinamentos(true);
    setMostrarMembros(false);
    setMostrarUsuarios(false);
    setMostrarRelatorios(false);
    setMostrarNovoProjeto(false);
    setSelecionadoId(null);
    setRascunho(null);
  }

  function exportarProjetosCSV() {
    const cabecalhos = [
      "ID",
      "Projeto",
      "Tipo",
      "Genero",
      "Prioridade",
      "Dupla",
      "Lider",
      "Telefone_Lider",
      "Editor",
      "Telefone_Editor",
      "Status",
      "Data_Inicio",
      "Video_Editor_Link",
      "Registro_Semanal",
      "Observacoes",
      "Capa_URL",
      "Arquivado",
      "Qtd_Elenco",
    ];

    const linhas = filtrados.map((p) =>
      [
        p.ID,
        p.Projeto,
        p.Tipo,
        p.Genero,
        p.Prioridade,
        p.Dupla,
        p.Lider,
        p.Telefone_Lider,
        p.Editor,
        p.Telefone_Editor,
        p.Status,
        p.Data_Inicio,
        p.Video_Editor_Link,
        p.Registro_Semanal,
        p.Observacoes,
        p.Capa_URL,
        p.Arquivado ? "Sim" : "Não",
        String(p.Elenco.length),
      ]
        .map(escaparCSV)
        .join(";")
    );

    const conteudo = "\uFEFF" + [cabecalhos.join(";"), ...linhas].join("\n");
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projetos_dubworks_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportarElencoCSV() {
    const cabecalhos = [
      "Projeto",
      "ID_Projeto",
      "Personagem",
      "Dublador",
      "Funcao",
      "Qtd_Projetos_Dublador",
      "Qtd_Papeis_Dublador",
    ];

    const linhas: string[] = [];
    filtrados.forEach((projeto) => {
      projeto.Elenco.forEach((item) => {
        const ranking = rankingDubladores.find(
          (r) => normalizar(r.nome) === normalizar(item.dublador)
        );

        linhas.push(
          [
            projeto.Projeto,
            projeto.ID,
            item.personagem,
            item.dublador,
            item.funcao,
            String(ranking?.totalProjetos || 0),
            String(ranking?.totalPapeis || 0),
          ]
            .map(escaparCSV)
            .join(";")
        );
      });
    });

    const conteudo = "\uFEFF" + [cabecalhos.join(";"), ...linhas].join("\n");
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elenco_dubworks_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function alterarStatusMembro(membro: Membro, status: StatusMembro) {
    if (!membro.id || !podeGerenciarMembros(usuarioLogado)) return;

    const confirmar = confirm(
      `Alterar status de ${membro.nome} para "${statusMembroLabel(status)}"?`
    );
    if (!confirmar) return;

    const ok = await atualizarStatusMembroBanco(
      membro.id,
      status,
      membro.observacao
    );

    if (!ok) {
      alert("Não consegui atualizar o membro.");
      return;
    }

    await recarregarMembros();
  }

  async function atualizarMembroCampo(
    membro: Membro,
    campo: "data_entrada" | "data_saida" | "observacao",
    valor: string
  ) {
    if (!membro.id || !podeGerenciarMembros(usuarioLogado)) return;

    const payload: any = { [campo]: valor || null };
    const { error } = await supabase
      .from("membros")
      .update(payload)
      .eq("id", membro.id);

    if (error) {
      console.error("Erro ao atualizar membro:", error);
      alert("Não consegui atualizar o membro.");
      return;
    }

    setMembros((lista) =>
      lista.map((item) =>
        item.id === membro.id ? { ...item, [campo]: valor || null } : item
      )
    );
  }

  function exportarMembrosCSV() {
    const cabecalhos = [
      "Nome",
      "Telefone",
      "Email",
      "Idade",
      "Data_Entrada",
      "Status",
      "Data_Saida",
      "Habilidades",
      "Observacao",
    ];

    const linhas = membrosFiltrados.map((m) =>
      [
        m.nome,
        m.telefone,
        m.email,
        String(m.idade || ""),
        formatarDataBR(m.data_entrada),
        statusMembroLabel(m.status),
        formatarDataBR(m.data_saida),
        m.habilidades || "",
        m.observacao || "",
      ]
        .map(escaparCSV)
        .join(";")
    );

    const conteudo = "\uFEFF" + [cabecalhos.join(";"), ...linhas].join("\n");
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `membros_dubworks_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportarRelatorioEntradaSaidaCSV() {
    const cabecalhos = [
      "Mês",
      "Total inicial",
      "Entradas",
      "Saídas",
      "Crescimento",
      "Total final",
    ];

    const linhas = relatorioEntradaSaida.map((r) =>
      [
        r.mesLabel,
        String(r.totalInicial),
        String(r.entradas),
        String(r.saidas),
        String(r.crescimento),
        String(r.totalFinal),
      ]
        .map(escaparCSV)
        .join(";")
    );

    const conteudo = "\uFEFF" + [cabecalhos.join(";"), ...linhas].join("\n");
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_entrada_saida_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!usuarioLogado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 18% 68%, rgba(37, 99, 235, 0.45), transparent 22%), radial-gradient(circle at 75% 28%, rgba(14, 165, 233, 0.36), transparent 24%), linear-gradient(135deg, #020617 0%, #111827 48%, #07152f 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? 18 : 24,
          fontFamily: "Arial, sans-serif",
          color: "#f8fafc",
        }}
      >
        <style>{estilosAnimacao}</style>

        <div
          style={{
            position: "absolute",
            width: isMobile ? 170 : 260,
            height: isMobile ? 170 : 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 68% 26%, #7dd3fc 0%, #1d4ed8 34%, #020617 82%)",
            top: isMobile ? 18 : 38,
            left: isMobile ? "54%" : "50%",
            transform: "translateX(-50%)",
            filter: "drop-shadow(0 0 46px rgba(59, 130, 246, 0.55))",
            animation: "dwFloat 7s ease-in-out infinite",
            opacity: 0.98,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: isMobile ? 150 : 230,
            height: isMobile ? 150 : 230,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 70% 28%, #38bdf8 0%, #2563eb 38%, #050816 84%)",
            right: isMobile ? -70 : "12%",
            top: isMobile ? 170 : "29%",
            filter: "drop-shadow(0 0 42px rgba(59, 130, 246, 0.45))",
            animation: "dwFloat 8s ease-in-out infinite reverse",
            opacity: 0.82,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: isMobile ? 170 : 260,
            height: isMobile ? 170 : 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 70% 28%, #60a5fa 0%, #1d4ed8 36%, #020617 86%)",
            left: isMobile ? -92 : "12%",
            bottom: isMobile ? 74 : "14%",
            filter: "drop-shadow(0 0 42px rgba(37, 99, 235, 0.45))",
            animation: "dwFloat 9s ease-in-out infinite",
            opacity: 0.78,
          }}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: isMobile ? "100%" : 620,
            padding: isMobile ? "82px 20px 24px" : "92px 58px 42px",
            borderRadius: isMobile ? 30 : 34,
            border: "1px solid rgba(191, 219, 254, 0.42)",
            background:
              "linear-gradient(145deg, rgba(15, 23, 42, 0.72), rgba(30, 41, 59, 0.52))",
            backdropFilter: "blur(18px)",
            boxShadow:
              "0 34px 110px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 70px rgba(37, 99, 235, 0.18)",
            overflow: "hidden",
            animation: "dwFadeUp .65s ease both",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.10), transparent)",
              animation: "dwScan 5.6s linear infinite",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <img
              src={LOGO_URL}
              alt="DubWorks"
              style={{
                width: isMobile ? 122 : 152,
                height: "auto",
                display: "block",
                margin: "0 auto 20px",
                filter: "drop-shadow(0 0 18px rgba(96, 165, 250, 0.32))",
              }}
            />

            <div
              style={{
                textAlign: "center",
                letterSpacing: 3,
                fontSize: isMobile ? 15 : 17,
                color: "#93c5fd",
                fontWeight: 800,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Acesso interno
            </div>

            <h1
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: isMobile ? 30 : 40,
                lineHeight: 1.05,
                color: "#f8fafc",
                textShadow: "0 0 28px rgba(59, 130, 246, 0.30)",
              }}
            >
              DubWorks Manager
            </h1>

            <p
              style={{
                textAlign: "center",
                marginTop: 10,
                marginBottom: isMobile ? 22 : 30,
                color: "#cbd5e1",
                fontSize: isMobile ? 14 : 15,
              }}
            >
              Central tecnológica de gerenciamento da DubWorks
            </p>

            <form onSubmit={fazerLogin}>
              <label style={{ ...labelStyle, color: "#cbd5e1" }}>E-mail</label>
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Digite seu e-mail"
                style={{
                  ...inputStyle,
                  marginBottom: 16,
                  background: "rgba(15, 23, 42, 0.72)",
                  border: "1px solid rgba(147, 197, 253, 0.32)",
                  color: "#f8fafc",
                  boxShadow: "inset 0 0 0 1px rgba(37, 99, 235, 0.05)",
                }}
              />

              <label style={{ ...labelStyle, color: "#cbd5e1" }}>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                style={{
                  ...inputStyle,
                  marginBottom: 16,
                  background: "rgba(15, 23, 42, 0.72)",
                  border: "1px solid rgba(147, 197, 253, 0.32)",
                  color: "#f8fafc",
                  boxShadow: "inset 0 0 0 1px rgba(37, 99, 235, 0.05)",
                }}
              />

              {erroLogin && (
                <div
                  style={{
                    background: "rgba(127, 29, 29, 0.35)",
                    color: "#fecaca",
                    border: "1px solid rgba(248, 113, 113, 0.35)",
                    padding: 12,
                    borderRadius: 14,
                    marginBottom: 16,
                  }}
                >
                  {erroLogin}
                </div>
              )}

              <button
                type="submit"
                disabled={carregandoLogin}
                style={{
                  ...botaoPrimarioStyleGrande,
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
                  boxShadow:
                    "0 18px 40px rgba(37, 99, 235, 0.38), 0 0 24px rgba(14, 165, 233, 0.22)",
                  letterSpacing: 0.4,
                }}
              >
                {carregandoLogin ? "Entrando..." : "Entrar no sistema"}
              </button>

              <button
                type="button"
                onClick={enviarRecuperacaoSenha}
                style={{
                  marginTop: 14,
                  background: "transparent",
                  border: "none",
                  color: "#93c5fd",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  padding: 10,
                }}
              >
                Esqueci minha senha
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const telaAtual = mostrarTreinamentos
    ? "treinamentos"
    : mostrarMembros
    ? "membros"
    : mostrarUsuarios
    ? "usuarios"
    : mostrarRelatorios
    ? "relatorios"
    : "projetos";

  const projetoPainel = selecionado || null;

  const projetoDrive = rascunho || projetoPainel;
  const driveSalvo = extrairLinksDrive(projetoDrive?.Observacoes);

  const driveLinks: {
    chave: "pasta" | "selecao" | "projeto" | "finalizados";
    titulo: string;
    descricao: string;
    icone: string;
    cor: string;
    link: string;
  }[] = [
    {
      chave: "pasta",
      titulo: "Pasta Principal",
      descricao: "Pasta principal do projeto com toda a estrutura oficial.",
      icone: "📁",
      cor: "#2563eb",
      link: driveSalvo.pasta || "",
    },
    {
      chave: "selecao",
      titulo: "1 | Seleção",
      descricao:
        "Falas teste, formulário de seleção, testes enviados e resultado.",
      icone: "🎙️",
      cor: "#7c3aed",
      link: driveSalvo.selecao || driveSalvo.videos || "",
    },
    {
      chave: "projeto",
      titulo: "2 | Projeto",
      descricao:
        "Cortes, cenas, áudios recebidos, edição e materiais em andamento.",
      icone: "🧩",
      cor: "#16a34a",
      link: driveSalvo.projeto || driveSalvo.cortes || "",
    },
    {
      chave: "finalizados",
      titulo: "3 | Finalizado",
      descricao:
        "Vídeo final, créditos, thumbs, capas, renders e arquivos concluídos.",
      icone: "🎬",
      cor: "#f97316",
      link: driveSalvo.finalizados || "",
    },
  ];

  const historicoProjetoDemo = [
    {
      usuario: "Sistema",
      acao: "alterou o link da pasta principal",
      data: "Hoje, 14:20",
    },
    {
      usuario: "Sistema",
      acao: "incluiu um novo teste de vídeo",
      data: "Hoje, 13:05",
    },
    {
      usuario: usuarioLogado?.nome || "Sistema",
      acao: "atualizou as informações do projeto",
      data: "Ontem, 18:42",
    },
  ];

  // TODO SUPABASE:
  // Estas notificações deverão ser geradas automaticamente
  // com base nas ações reais dos usuários.
  // Exemplo:
  // criar projeto, alterar link, enviar relatório, adicionar elenco etc.

  const notificacoesProjeto = projetoPainel
    ? [
        {
          usuario: usuarioLogado?.nome || "Sistema",
          acao: `acessou/atualizou o projeto ${projetoPainel.Projeto}`,
          data: new Date().toLocaleString("pt-BR"),
          tipo: "Projeto",
          projetoId: projetoPainel.ID,
          lider: projetoPainel.Lider,
          editor: projetoPainel.Editor,
        },
      ].filter((notificacao) => {
        if (!usuarioLogado || !projetoPainel) return false;

        if (
          usuarioLogado.cargo === "diretoria" ||
          usuarioLogado.cargo === "adm"
        ) {
          return notificacao.projetoId === projetoPainel.ID;
        }

        const vinculo = normalizar(
          usuarioLogado.vinculo || usuarioLogado.nome || usuarioLogado.login
        );

        if (
          usuarioLogado.cargo === "lider" ||
          usuarioLogado.cargo === "lider_treinamento"
        ) {
          return (
            notificacao.projetoId === projetoPainel.ID &&
            normalizar(notificacao.lider) === vinculo
          );
        }

        if (usuarioLogado.cargo === "editor") {
          return (
            notificacao.projetoId === projetoPainel.ID &&
            normalizar(notificacao.editor) === vinculo
          );
        }

        return false;
      })
    : [];

  function abrirLink(link?: string) {
    if (!link) {
      alert("Link ainda não cadastrado.");
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  }

  const membroSelecionado =
    membros.find((m) => m.id === membroSelecionadoId) || null;

  function cargoMembro(membro: Membro | null) {
    if (!membro) return "Membro";
    const alvo = normalizar(membro.email || membro.nome);
    const perfil = usuarios.find(
      (u) =>
        normalizar(u.login) === alvo ||
        normalizar(u.nome) === normalizar(membro.nome)
    );
    return perfil ? cargoLabel(perfil.cargo) : "Membro";
  }

  async function salvarRegistroSemanalProjeto() {
    if (!projetoPainel || !registroSemanalTexto.trim()) {
      alert("Selecione um projeto e escreva o registro semanal.");
      return;
    }

    const agora = new Date();
    const carimbo = agora.toLocaleString("pt-BR");
    const autor = usuarioLogado?.nome || "Usuário";
    const novoRegistro = `[${carimbo}] ${autor}: ${registroSemanalTexto.trim()}`;
    const registroAnterior = projetoPainel.Registro_Semanal || "";
    const projetoAtualizado: Projeto = {
      ...projetoPainel,
      Registro_Semanal: [novoRegistro, registroAnterior]
        .filter(Boolean)
        .join("\n\n"),
    };

    const ok = await atualizarProjetoBanco(projetoAtualizado);
    if (!ok) {
      alert("Não consegui salvar o registro semanal.");
      return;
    }

    setRegistroSemanalTexto("");
    await recarregarProjetos();
    alert("Registro semanal salvo com data e hora.");
  }

  const SidebarItem = ({
    id,
    label,
    icon,
    onClick,
  }: {
    id: string;
    label: string;
    icon: string;
    onClick: () => void;
  }) => {
    const ativo = telaAtual === id;
    return (
      <button
        onClick={onClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          border: "none",
          borderRadius: 14,
          padding: "14px 16px",
          cursor: "pointer",
          color: ativo ? "#38bdf8" : "#cbd5e1",
          background: ativo
            ? "linear-gradient(90deg, rgba(37,99,235,0.24), rgba(14,165,233,0.08))"
            : "transparent",
          textAlign: "left",
          fontWeight: ativo ? 800 : 700,
          fontSize: 15,
        }}
      >
        <span style={{ fontSize: 19, width: 22, textAlign: "center" }}>
          {icon}
        </span>
        {label}
      </button>
    );
  };

  const MiniStat = ({
    icon,
    value,
    label,
    color,
  }: {
    icon: string;
    value: string;
    label: string;
    color: string;
  }) => (
    <div
      style={{
        background: "rgba(2,6,23,0.55)",
        border: "1px solid rgba(148,163,184,0.16)",
        borderRadius: 14,
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: `${color}22`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#f8fafc" }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>{label}</div>
      </div>
    </div>
  );

  const ProjectList = () => (
    <div
      style={{
        ...painelDarkStyle,
        minHeight: 240,
        overflow: "hidden",
      }}
    >
      <div style={painelHeaderStyle}>
        <h2 style={tituloCardDarkStyle}>Projetos ativos</h2>
        <span style={{ color: "#94a3b8", fontSize: 13 }}>
          {filtrados.length} projeto(s)
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}
        >
          <thead>
            <tr>
              {[
                "ID",
                "Projeto",
                "Tipo",
                "Gênero",
                "Prioridade",
                "Status",
                "Líder",
                "Editor",
              ].map((h) => (
                <th key={h} style={tabelaHeaderDarkStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.slice(0, 35).map((p) => {
              const statusCor = corStatus(p.Status);
              const ativo = p.ID === projetoPainel?.ID;
              return (
                <tr
                  key={p.ID}
                  onClick={() => setSelecionadoId(p.ID)}
                  style={{
                    cursor: "pointer",
                    background: ativo ? "rgba(37,99,235,0.18)" : "transparent",
                    borderBottom: "1px solid rgba(148,163,184,0.10)",
                  }}
                >
                  <td style={tabelaCellDarkStyle}>{p.ID}</td>
                  <td
                    style={{
                      ...tabelaCellDarkStyle,
                      fontWeight: 800,
                      color: "#f8fafc",
                    }}
                  >
                    {p.Projeto}
                    <div
                      style={{
                        color: "#94a3b8",
                        fontWeight: 500,
                        fontSize: 12,
                      }}
                    >
                      {p.Elenco.length} registro(s) de elenco
                    </div>
                  </td>
                  <td style={tabelaCellDarkStyle}>{p.Tipo || "-"}</td>
                  <td style={tabelaCellDarkStyle}>{p.Genero || "-"}</td>
                  <td style={tabelaCellDarkStyle}>{p.Prioridade || "-"}</td>
                  <td style={tabelaCellDarkStyle}>
                    <span
                      style={{
                        background: statusCor.bg,
                        color: statusCor.color,
                        border: "1px solid rgba(148,163,184,0.12)",
                        padding: "6px 10px",
                        borderRadius: 10,
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      {p.Status || "Sem status"}
                    </span>
                  </td>
                  <td style={tabelaCellDarkStyle}>{p.Lider || "-"}</td>
                  <td style={tabelaCellDarkStyle}>{p.Editor || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ProjectDetails = () => {
    if (!projetoPainel) {
      return (
        <div style={painelDarkStyle}>
          <h2 style={tituloCardDarkStyle}>Nenhum projeto selecionado</h2>
          <p style={{ color: "#94a3b8" }}>
            Selecione um projeto na lista ou crie um novo projeto.
          </p>
        </div>
      );
    }

    const statusCor = corStatus(projetoPainel.Status);
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <div
          style={{
            background: projetoPainel.Capa_URL
              ? `linear-gradient(rgba(2,6,23,0.25), rgba(2,6,23,0.72)), url(${projetoPainel.Capa_URL}) center/cover`
              : "linear-gradient(135deg, rgba(37,99,235,0.95), rgba(14,165,233,0.68))",
            border: "1px solid rgba(56,189,248,0.24)",
            borderRadius: 22,
            padding: 38,
            minHeight: 170,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            boxShadow: "0 22px 60px rgba(37,99,235,0.22)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#fff",
              fontSize: 26,
              textShadow: "0 2px 18px rgba(0,0,0,0.48)",
            }}
          >
            {projetoPainel.Projeto}
          </h2>
        </div>

        <div style={painelDarkStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1 style={{ margin: 0, color: "#dbeafe", fontSize: 26 }}>
                {projetoPainel.Projeto}
              </h1>
              <div style={{ color: "#94a3b8", marginTop: 6 }}>
                ID: {projetoPainel.ID}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setSelecionadoId(null);
                  setRascunho(null);
                  setAbaProjeto("informacoes");
                }}
                style={botaoSecundarioStyle}
              >
                Fechar projeto
              </button>
              {!rascunho || rascunho.ID !== projetoPainel.ID ? (
                <button
                  onClick={() => setSelecionadoId(projetoPainel.ID)}
                  style={botaoSecundarioStyle}
                >
                  Editar informações
                </button>
              ) : (
                <button onClick={salvarAlteracoes} style={botaoPrimarioStyle}>
                  Salvar alterações
                </button>
              )}
            </div>
          </div>

          {rascunho && rascunho.ID === projetoPainel.ID ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
                gap: 14,
                marginTop: 22,
              }}
            >
              {[
                ["Projeto", "Projeto"],
                ["Tipo", "Tipo"],
                ["Gênero", "Genero"],
                ["Prioridade", "Prioridade"],
                ["Status", "Status"],
                ["Líder", "Lider"],
                ["Editor", "Editor"],
                ["Data de início", "Data_Inicio"],
                ["Capa do projeto (URL)", "Capa_URL"],
                ["Drive — Pasta principal", "Drive_Pasta_Link"],
                ["Drive — Vídeos dos personagens", "Drive_Videos_Link"],
                ["Drive — Cortes / Cenas", "Drive_Cortes_Link"],
                ["Drive — Finalizados", "Drive_Final_Link"],
              ].map(([label, campo]) => (
                <div key={campo}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    value={String((rascunho as any)[campo] || "")}
                    onChange={(e) =>
                      atualizarCampo(campo as keyof Projeto, e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
                gap: 14,
                marginTop: 22,
              }}
            >
              {[
                ["Tipo", projetoPainel.Tipo],
                ["Gênero", projetoPainel.Genero],
                ["Prioridade", projetoPainel.Prioridade],
                ["Líder", projetoPainel.Lider],
                ["Editor", projetoPainel.Editor],
                ["Data de início", formatarDataBR(projetoPainel.Data_Inicio)],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>{label}</div>
                  <div
                    style={{ color: "#f8fafc", fontWeight: 800, marginTop: 4 }}
                  >
                    {value || "-"}
                  </div>
                </div>
              ))}
              <div>
                <div style={{ color: "#94a3b8", fontSize: 13 }}>Status</div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 6,
                    background: statusCor.bg,
                    color: statusCor.color,
                    border: "1px solid rgba(148,163,184,0.12)",
                    padding: "8px 12px",
                    borderRadius: 10,
                    fontWeight: 900,
                  }}
                >
                  {projetoPainel.Status || "Sem status"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const DrivePanel = () => (
    <div style={painelDarkStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
          marginBottom: 18,
        }}
      >
        <div>
          <h2
            style={{
              ...tituloCardDarkStyle,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>📁</span> Arquivos do Drive
          </h2>
          <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>
            Crie a estrutura oficial no Google Drive ou cole os links
            manualmente. Estrutura: 1 | Seleção, 2 | Projeto e 3 | Finalizado.
          </p>
        </div>

        {projetoPainel && podeEditarProjeto(usuarioLogado, projetoPainel) && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={criarEstruturaDriveProjeto}
              disabled={criandoEstruturaDrive}
              style={{
                ...botaoPrimarioStyle,
                opacity: criandoEstruturaDrive ? 0.7 : 1,
                cursor: criandoEstruturaDrive ? "not-allowed" : "pointer",
              }}
            >
              {criandoEstruturaDrive
                ? "Criando estrutura..."
                : "Criar estrutura no Drive"}
            </button>

            <button
              onClick={salvarLinksDriveComHistorico}
              style={botaoSecundarioStyle}
            >
              Salvar links
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(56,189,248,.25)",
          background: "rgba(14,165,233,.08)",
          color: "#cbd5e1",
          marginBottom: 16,
        }}
      >
        <strong style={{ color: "#f8fafc" }}>
          Integração Google Drive — Beta
        </strong>
        <br />O botão cria a pasta principal do projeto e as subpastas oficiais:
        <strong> 1 | Seleção</strong>, <strong>2 | Projeto</strong> e{" "}
        <strong>3 | Finalizado</strong>. Se a função do Supabase ainda não
        estiver configurada, o app apenas avisará sem quebrar o sistema.
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {driveLinks.map((item) => (
          <div
            key={item.titulo}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "48px 1fr" : "56px 1fr auto",
              gap: 14,
              alignItems: "center",
              padding: "14px 0",
              borderTop: "1px solid rgba(148,163,184,0.12)",
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                background: `${item.cor}22`,
                color: item.cor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {item.icone}
            </div>

            <div>
              <div style={{ color: "#f8fafc", fontWeight: 900 }}>
                {item.titulo}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                {item.descricao}
              </div>

              <input
                placeholder="Cole o link desta pasta aqui"
                value={item.link || ""}
                onChange={(e) => {
                  if (!rascunho) return;

                  const linksAtuais = extrairLinksDrive(rascunho.Observacoes);
                  const novosLinks = {
                    ...linksAtuais,
                    [item.chave]: e.target.value,
                  };

                  setRascunho({
                    ...rascunho,
                    Observacoes: salvarLinksDriveEmObservacoes(
                      rascunho.Observacoes,
                      novosLinks
                    ),
                  });
                }}
                disabled={
                  !projetoPainel ||
                  !podeEditarProjeto(usuarioLogado, projetoPainel)
                }
                style={{
                  ...inputStyle,
                  marginTop: 10,
                  color: "#38bdf8",
                  border: "1px solid rgba(37,99,235,0.45)",
                }}
              />

              {!podeEditarProjeto(usuarioLogado, projetoPainel) && (
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
                  Você pode visualizar este link, mas não tem permissão para
                  editar.
                </div>
              )}

              {isMobile && (
                <button
                  onClick={() => abrirLink(item.link || "")}
                  style={{ ...botaoSecundarioStyle, marginTop: 10 }}
                >
                  Abrir ↗
                </button>
              )}
            </div>

            {!isMobile && (
              <button
                onClick={() => abrirLink(item.link || "")}
                style={botaoSecundarioStyle}
              >
                Abrir ↗
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const MembersPage = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={pageHeaderDarkStyle}>
        <div>
          <div style={breadcrumbDarkStyle}>Membros</div>
          <h1 style={pageTitleDarkStyle}>Central de Membros</h1>
        </div>
        <button
          onClick={async () => {
            await recarregarMembros();
            alert("Membros atualizados.");
          }}
          style={botaoPrimarioStyle}
        >
          Atualizar membros
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <MiniStat
          icon="👥"
          value={String(membros.length)}
          label="Total de membros"
          color="#38bdf8"
        />
        <MiniStat
          icon="✅"
          value={String(totalMembrosAtivos)}
          label="Na comunidade"
          color="#22c55e"
        />
        <MiniStat
          icon="↪"
          value={String(totalMembrosSaida)}
          label="Saíram"
          color="#f97316"
        />
        <MiniStat
          icon="📈"
          value={String(
            relatorioEntradaSaida[relatorioEntradaSaida.length - 1]
              ?.totalFinal || 0
          )}
          label="Crescimento"
          color="#a78bfa"
        />
      </div>

      {membroSelecionado && (
        <div style={painelDarkStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={tituloCardDarkStyle}>{membroSelecionado.nome}</h2>
              <p style={{ color: "#94a3b8", marginTop: 6 }}>
                Pré-visualização do membro selecionado
              </p>
            </div>
            <button
              onClick={() => setMembroSelecionadoId(null)}
              style={botaoSecundarioStyle}
            >
              Fechar membro
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 14,
              marginTop: 18,
            }}
          >
            <div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>Perfil/Cargo</div>
              <div style={{ color: "#f8fafc", fontWeight: 900 }}>
                {cargoMembro(membroSelecionado)}
              </div>
            </div>
            <div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>Telefone</div>
              <div style={{ color: "#f8fafc", fontWeight: 900 }}>
                {membroSelecionado.telefone || "-"}
              </div>
            </div>
            <div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>E-mail</div>
              <div style={{ color: "#f8fafc", fontWeight: 900 }}>
                {membroSelecionado.email || "-"}
              </div>
            </div>
            <div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>Idade</div>
              <div style={{ color: "#f8fafc", fontWeight: 900 }}>
                {membroSelecionado.idade || "-"}
              </div>
            </div>
            <div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>Entrada</div>
              <input
                type="date"
                value={membroSelecionado.data_entrada || ""}
                onChange={(e) =>
                  atualizarMembroCampo(
                    membroSelecionado,
                    "data_entrada",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>
            <div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>Status</div>
              <select
                value={membroSelecionado.status}
                onChange={(e) =>
                  alterarStatusMembro(
                    membroSelecionado,
                    e.target.value as StatusMembro
                  )
                }
                style={inputStyle}
              >
                <option value="na_comunidade">Na comunidade</option>
                <option value="saiu">Saiu</option>
                <option value="banido">Banido</option>
                <option value="pausado">Pausado</option>
              </select>
            </div>
            <div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>Saída</div>
              <input
                type="date"
                value={membroSelecionado.data_saida || ""}
                onChange={(e) =>
                  atualizarMembroCampo(
                    membroSelecionado,
                    "data_saida",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ color: "#94a3b8", fontSize: 13 }}>Habilidades</div>
            <div style={{ color: "#cbd5e1", marginTop: 6 }}>
              {membroSelecionado.habilidades || "Não informado."}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ color: "#94a3b8", fontSize: 13 }}>Observações</div>
            <textarea
              value={membroSelecionado.observacao || ""}
              onChange={(e) =>
                setMembros((lista) =>
                  lista.map((item) =>
                    item.id === membroSelecionado.id
                      ? { ...item, observacao: e.target.value }
                      : item
                  )
                )
              }
              onBlur={(e) =>
                atualizarMembroCampo(
                  membroSelecionado,
                  "observacao",
                  e.target.value
                )
              }
              style={{ ...textareaStyle, minHeight: 90, marginTop: 6 }}
            />
          </div>
        </div>
      )}

      <div style={painelDarkStyle}>
        <input
          placeholder="Buscar por nome, telefone, e-mail, status ou observação..."
          value={queryMembros}
          onChange={(e) => setQueryMembros(e.target.value)}
          style={{ ...inputStyle, marginBottom: 16 }}
        />

        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr>
                {[
                  "Nome",
                  "Telefone",
                  "E-mail",
                  "Idade",
                  "Entrada",
                  "Status",
                  "Saída",
                ].map((h) => (
                  <th key={h} style={tabelaHeaderDarkStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {membrosFiltrados.slice(0, 80).map((m) => {
                const cor = corStatusMembro(m.status);
                return (
                  <tr
                    key={m.id || m.nome}
                    onClick={() => setMembroSelecionadoId(m.id || null)}
                    style={{
                      borderBottom: "1px solid rgba(148,163,184,0.10)",
                      cursor: "pointer",
                      background:
                        membroSelecionadoId === m.id
                          ? "rgba(37,99,235,0.18)"
                          : "transparent",
                    }}
                  >
                    <td style={{ ...tabelaCellDarkStyle, fontWeight: 800 }}>
                      {m.nome}
                    </td>
                    <td style={tabelaCellDarkStyle}>{m.telefone || "-"}</td>
                    <td style={tabelaCellDarkStyle}>{m.email || "-"}</td>
                    <td style={tabelaCellDarkStyle}>{m.idade || "-"}</td>
                    <td style={tabelaCellDarkStyle}>
                      {formatarDataBR(m.data_entrada) || "-"}
                    </td>
                    <td style={tabelaCellDarkStyle}>
                      <span
                        style={{
                          background: cor.bg,
                          color: cor.color,
                          padding: "7px 10px",
                          borderRadius: 10,
                          fontWeight: 900,
                        }}
                      >
                        {statusMembroLabel(m.status)}
                      </span>
                    </td>
                    <td style={tabelaCellDarkStyle}>
                      {formatarDataBR(m.data_saida) || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {membrosFiltrados.length > 80 && (
            <div style={{ color: "#94a3b8", marginTop: 12, fontSize: 13 }}>
              Mostrando 80 de {membrosFiltrados.length}. Use a busca para
              filtrar.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const UsersPage = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        style={{
          ...painelDarkStyle,
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
        }}
      >
        <div>
          <h2 style={tituloCardDarkStyle}>Controle de Usuários e Permissões</h2>
          <p style={{ color: "#94a3b8", marginTop: 6 }}>
            Gerencie cargos, permissões e acessos internos do sistema.
          </p>
        </div>

        <button
          onClick={() => setMostrarFormNovoUsuario((valor) => !valor)}
          style={botaoPrimarioStyle}
        >
          + Novo usuário
        </button>
      </div>

      {mostrarFormNovoUsuario && (
        <div style={painelDarkStyle}>
          <h2 style={tituloCardDarkStyle}>Novo usuário</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: 14,
              marginTop: 14,
            }}
          >
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                value={novoUsuario.nome}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, nome: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>E-mail/Login</label>
              <input
                value={novoUsuario.login}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, login: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Cargo</label>
              <select
                value={novoUsuario.cargo}
                onChange={(e) => {
                  const cargo = e.target.value as Cargo;
                  setNovoUsuario({
                    ...novoUsuario,
                    cargo,
                    training_status: statusPadraoPorCargo(cargo),
                    ...permissoesPadraoUsuario(cargo),
                  });
                }}
                style={inputStyle}
              >
                {cargosPermitidosParaCriar(usuarioLogado).map((cargo) => (
                  <option key={cargo} value={cargo}>
                    {cargoLabel(cargo)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Vínculo</label>
              <input
                value={novoUsuario.vinculo}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, vinculo: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 10,
              marginTop: 16,
            }}
          >
            {permissoesDisponiveis.map((item) => (
              <label
                key={item.chave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#cbd5e1",
                  fontWeight: 700,
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(novoUsuario[item.chave])}
                  onChange={(e) =>
                    setNovoUsuario({
                      ...novoUsuario,
                      [item.chave]: e.target.checked,
                    })
                  }
                />
                {item.label}
              </label>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 18,
              flexWrap: "wrap",
            }}
          >
            <button onClick={criarUsuario} style={botaoPrimarioStyle}>
              Salvar usuário
            </button>
            <button
              onClick={() => setMostrarFormNovoUsuario(false)}
              style={botaoSecundarioStyle}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          ...painelDarkStyle,
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "Usuário",
                "Cargo",
                "Projetos",
                "Membros",
                "Usuários",
                "Relatórios",
              ].map((titulo) => (
                <th
                  key={titulo}
                  style={{
                    textAlign: "left",
                    padding: 14,
                    color: "#94a3b8",
                    fontSize: 13,
                    borderBottom: "1px solid rgba(148,163,184,0.14)",
                  }}
                >
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id || usuario.login}>
                <td
                  style={{
                    padding: 14,
                    borderBottom: "1px solid rgba(148,163,184,0.08)",
                  }}
                >
                  <div style={{ color: "#f8fafc", fontWeight: 700 }}>
                    {usuario.nome}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>
                    @{usuario.login}
                  </div>
                </td>

                <td style={{ padding: 14, color: "#cbd5e1" }}>
                  {usuario.cargo}
                </td>

                {(
                  [
                    "acesso_projetos",
                    "acesso_membros",
                    "acesso_usuarios",
                    "acesso_relatorios_projetos",
                  ] as ChavePermissao[]
                ).map((chave) => {
                  const permitido = temAcesso(usuario, chave);
                  return (
                    <td
                      key={chave}
                      style={{
                        padding: 14,
                        color: permitido ? "#22c55e" : "#ef4444",
                        fontWeight: 700,
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={permitido}
                          disabled={!podeGerenciarUsuarios(usuarioLogado)}
                          onChange={(e) =>
                            atualizarPermissaoUsuario(
                              usuario,
                              chave,
                              e.target.checked
                            )
                          }
                        />
                        {permitido ? "Permitido" : "Bloqueado"}
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={pageHeaderDarkStyle}>
        <div>
          <div style={breadcrumbDarkStyle}>Usuários</div>
          <h1 style={pageTitleDarkStyle}>Acessos e Permissões</h1>
        </div>
        <button onClick={recarregarUsuarios} style={botaoPrimarioStyle}>
          Atualizar
        </button>
      </div>

      <div style={painelDarkStyle}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}
          >
            <thead>
              <tr>
                {["Nome", "Login", "Cargo", "Vínculo", "Treinamento"].map(
                  (h) => (
                    <th key={h} style={tabelaHeaderDarkStyle}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {usuariosVisiveis.map((u) => (
                <tr
                  key={u.id || u.login}
                  style={{ borderBottom: "1px solid rgba(148,163,184,0.10)" }}
                >
                  <td style={{ ...tabelaCellDarkStyle, fontWeight: 800 }}>
                    {u.nome}
                  </td>
                  <td style={tabelaCellDarkStyle}>{u.login}</td>
                  <td style={tabelaCellDarkStyle}>{cargoLabel(u.cargo)}</td>
                  <td style={tabelaCellDarkStyle}>{u.vinculo || "-"}</td>
                  <td style={tabelaCellDarkStyle}>
                    {statusTreinamentoLabel(u.training_status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReportsPage = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={pageHeaderDarkStyle}>
        <div>
          <div style={breadcrumbDarkStyle}>Relatórios</div>
          <h1 style={pageTitleDarkStyle}>Exportações e Indicadores</h1>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        <button onClick={exportarProjetosCSV} style={reportCardDarkStyle}>
          📌 Exportar Projetos
        </button>
        <button onClick={exportarElencoCSV} style={reportCardDarkStyle}>
          🎙️ Exportar Elenco
        </button>
        {podeGerenciarMembros(usuarioLogado) && (
          <button onClick={exportarMembrosCSV} style={reportCardDarkStyle}>
            👥 Exportar Membros
          </button>
        )}
        {podeGerenciarMembros(usuarioLogado) && (
          <button
            onClick={exportarRelatorioEntradaSaidaCSV}
            style={reportCardDarkStyle}
          >
            📊 Entrada e Saída
          </button>
        )}
      </div>
    </div>
  );

  const cardDarkStyle: React.CSSProperties = {
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,.22)",
    background: "rgba(15,23,42,.72)",
    boxShadow: "0 18px 45px rgba(0,0,0,.18)",
  };

  const TrainingPage = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={pageHeaderDarkStyle}>
        <div>
          <div style={breadcrumbDarkStyle}>
            Treinamentos › Formação de Líderes
          </div>
          <h1 style={pageTitleDarkStyle}>Treinamento de Líderes</h1>
          <p style={{ color: "#94a3b8", margin: 0 }}>
            Área interna para formar, acompanhar e avaliar líderes de projetos
            da DubWorks.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {podeGerenciarTreinamentos(usuarioLogado) && (
            <button
              onClick={() => {
                setMostrarResultadosTreinamento(!mostrarResultadosTreinamento);
                recarregarRespostasTreinamento();
              }}
              style={botaoSecundarioGrandeStyle}
            >
              {mostrarResultadosTreinamento
                ? "Ver módulos"
                : "Resultados das respostas"}
            </button>
          )}

          <button
            onClick={() => {
              setMostrarTreinamentos(false);
              setMostrarRelatorios(false);
              setMostrarUsuarios(false);
              setMostrarMembros(false);
            }}
            style={botaoSecundarioGrandeStyle}
          >
            Voltar aos projetos
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        <div style={cardDarkStyle}>
          <div style={{ color: "#94a3b8" }}>Progresso geral</div>
          <strong style={{ fontSize: 34, color: "#f8fafc" }}>
            {progressoTreinamento}%
          </strong>
        </div>
        <div style={cardDarkStyle}>
          <div style={{ color: "#94a3b8" }}>Módulos</div>
          <strong style={{ fontSize: 34, color: "#f8fafc" }}>
            {modulosTreinamentoLider.length}
          </strong>
        </div>
        <div style={cardDarkStyle}>
          <div style={{ color: "#94a3b8" }}>Questões corretas</div>
          <strong style={{ fontSize: 34, color: "#f8fafc" }}>
            {respostasCorretasTreinamento}/{totalPerguntasTreinamento}
          </strong>
        </div>
        <div style={cardDarkStyle}>
          <div style={{ color: "#94a3b8" }}>Status</div>
          <strong style={{ fontSize: 22, color: "#38bdf8" }}>
            {progressoTreinamento >= 100 ? "Concluído" : "Em andamento"}
          </strong>
        </div>
      </div>

      {mostrarResultadosTreinamento &&
      podeGerenciarTreinamentos(usuarioLogado) ? (
        <div style={painelDarkStyle}>
          <h2 style={tituloCardDarkStyle}>Resultados do treinamento</h2>
          <p style={{ color: "#94a3b8" }}>
            Aqui a diretoria acompanha as respostas enviadas pelos líderes em
            treinamento.
          </p>

          <button
            type="button"
            onClick={recarregarRespostasTreinamento}
            style={botaoSecundarioGrandeStyle}
          >
            Atualizar respostas
          </button>

          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {carregandoRespostasTreinamento && (
              <p style={{ color: "#94a3b8" }}>Carregando respostas...</p>
            )}

            {!carregandoRespostasTreinamento &&
              respostasTreinamentoSalvas.length === 0 && (
                <p style={{ color: "#94a3b8" }}>
                  Nenhuma resposta enviada ainda.
                </p>
              )}

            {!carregandoRespostasTreinamento &&
              respostasTreinamentoSalvas.map((resposta) => (
                <div
                  key={`${resposta.id || resposta.usuario_login}-${
                    resposta.modulo_id
                  }-${resposta.data_resposta}`}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: resposta.correta
                      ? "1px solid rgba(34,197,94,.35)"
                      : "1px solid rgba(248,113,113,.35)",
                    background: resposta.correta
                      ? "rgba(34,197,94,.08)"
                      : "rgba(248,113,113,.08)",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ color: "#f8fafc", fontWeight: 900 }}>
                    {resposta.usuario_nome || resposta.usuario_login} •{" "}
                    {resposta.modulo_titulo}
                  </div>

                  <div style={{ color: "#94a3b8" }}>
                    {resposta.data_resposta
                      ? new Date(resposta.data_resposta).toLocaleString("pt-BR")
                      : "Sem data registrada"}
                  </div>

                  <div style={{ color: "#cbd5e1" }}>
                    <strong>Pergunta:</strong> {resposta.pergunta}
                  </div>

                  <div style={{ color: "#cbd5e1" }}>
                    <strong>Resposta marcada:</strong>{" "}
                    {String.fromCharCode(65 + resposta.alternativa_marcada)}){" "}
                    {resposta.alternativa_texto}
                  </div>

                  <div
                    style={{
                      color: resposta.correta ? "#86efac" : "#fca5a5",
                      fontWeight: 900,
                    }}
                  >
                    {resposta.correta ? "Correta" : "Incorreta"}
                  </div>

                  <div style={{ color: "#94a3b8" }}>
                    <strong>Explicação:</strong> {resposta.explicacao}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "340px 1fr",
            gap: 18,
          }}
        >
          <div style={painelDarkStyle}>
            <h2 style={tituloCardDarkStyle}>Módulos do treinamento</h2>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {modulosTreinamentoLider.map((modulo) => (
                <button
                  key={modulo.id}
                  type="button"
                  onClick={() => setModuloTreinamentoAtivo(modulo.id)}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border:
                      moduloTreinamentoAtivo === modulo.id
                        ? "1px solid rgba(56,189,248,.65)"
                        : "1px solid rgba(148,163,184,.18)",
                    background:
                      moduloTreinamentoAtivo === modulo.id
                        ? "rgba(14,165,233,.16)"
                        : "rgba(15,23,42,.42)",
                    color: "#f8fafc",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  {modulo.titulo}
                </button>
              ))}
            </div>
          </div>

          <div style={painelDarkStyle}>
            <h2 style={tituloCardDarkStyle}>
              {moduloSelecionadoTreinamento.titulo}
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 16 }}>
              {moduloSelecionadoTreinamento.descricao}
            </p>

            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <h3 style={{ color: "#f8fafc", margin: 0 }}>Conteúdo</h3>
              {moduloSelecionadoTreinamento.conteudos.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,.18)",
                    background: "rgba(2,6,23,.34)",
                    color: "#cbd5e1",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {moduloSelecionadoTreinamento.pergunta && (
              <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
                <h3 style={{ color: "#f8fafc", margin: 0 }}>
                  Pergunta para concluir o módulo
                </h3>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: "1px solid rgba(56,189,248,.25)",
                    background: "rgba(14,165,233,.10)",
                    color: "#f8fafc",
                    fontWeight: 800,
                  }}
                >
                  {moduloSelecionadoTreinamento.pergunta.pergunta}
                </div>

                {moduloSelecionadoTreinamento.pergunta.alternativas.map(
                  (alternativa, index) => {
                    const selecionada =
                      respostasTreinamento[moduloSelecionadoTreinamento.id] ===
                      index;
                    const correta =
                      moduloSelecionadoTreinamento.pergunta?.correta === index;
                    const respondida =
                      respostasTreinamento[moduloSelecionadoTreinamento.id] !==
                      undefined;

                    return (
                      <button
                        key={`${moduloSelecionadoTreinamento.id}-${index}`}
                        type="button"
                        onClick={() =>
                          responderPerguntaTreinamento(
                            moduloSelecionadoTreinamento.id,
                            index
                          )
                        }
                        style={{
                          textAlign: "left",
                          padding: 16,
                          borderRadius: 16,
                          cursor: "pointer",
                          border: selecionada
                            ? correta
                              ? "1px solid rgba(34,197,94,.75)"
                              : "1px solid rgba(248,113,113,.75)"
                            : "1px solid rgba(148,163,184,.18)",
                          background: selecionada
                            ? correta
                              ? "rgba(34,197,94,.16)"
                              : "rgba(248,113,113,.14)"
                            : "rgba(15,23,42,.42)",
                          color: "#f8fafc",
                          fontWeight: 700,
                        }}
                      >
                        {String.fromCharCode(65 + index)}) {alternativa}
                      </button>
                    );
                  }
                )}

                {respostasTreinamento[moduloSelecionadoTreinamento.id] !==
                  undefined && (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      border:
                        respostasTreinamento[
                          moduloSelecionadoTreinamento.id
                        ] === moduloSelecionadoTreinamento.pergunta.correta
                          ? "1px solid rgba(34,197,94,.45)"
                          : "1px solid rgba(248,113,113,.45)",
                      background:
                        respostasTreinamento[
                          moduloSelecionadoTreinamento.id
                        ] === moduloSelecionadoTreinamento.pergunta.correta
                          ? "rgba(34,197,94,.10)"
                          : "rgba(248,113,113,.10)",
                      color: "#cbd5e1",
                    }}
                  >
                    <strong style={{ color: "#f8fafc" }}>
                      {respostasTreinamento[moduloSelecionadoTreinamento.id] ===
                      moduloSelecionadoTreinamento.pergunta.correta
                        ? "Resposta correta. Módulo concluído."
                        : "Resposta incorreta. Revise o conteúdo deste módulo."}
                    </strong>
                    <br />
                    {moduloSelecionadoTreinamento.pergunta.explicacao}
                  </div>
                )}

                {respostasTreinamento[moduloSelecionadoTreinamento.id] !==
                  undefined && (
                  <button
                    type="button"
                    onClick={() =>
                      enviarRespostaTreinamento(moduloSelecionadoTreinamento)
                    }
                    style={{
                      background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                      border: "none",
                      color: "#fff",
                      borderRadius: 14,
                      padding: "14px 18px",
                      cursor: "pointer",
                      fontWeight: 900,
                      boxShadow: "0 0 25px rgba(37,99,235,.35)",
                    }}
                  >
                    Enviar resposta para diretoria
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={painelDarkStyle}>
        <h2 style={tituloCardDarkStyle}>Avaliação manual do líder</h2>
        <p style={{ color: "#94a3b8" }}>
          Área para a diretoria registrar uma avaliação simples do líder em
          treinamento. Nesta versão, os dados ficam na tela; depois podemos
          salvar no Supabase.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          <div>
            <label style={labelStyle}>Líder avaliado</label>
            <input
              value={avaliacaoLider.lider}
              onChange={(e) =>
                setAvaliacaoLider({ ...avaliacaoLider, lider: e.target.value })
              }
              placeholder="Nome do líder"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Projeto relacionado</label>
            <input
              value={avaliacaoLider.projeto}
              onChange={(e) =>
                setAvaliacaoLider({
                  ...avaliacaoLider,
                  projeto: e.target.value,
                })
              }
              placeholder="Nome do projeto"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Nota</label>
            <input
              value={avaliacaoLider.nota}
              onChange={(e) =>
                setAvaliacaoLider({ ...avaliacaoLider, nota: e.target.value })
              }
              placeholder="0 a 10"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={avaliacaoLider.status}
              onChange={(e) =>
                setAvaliacaoLider({ ...avaliacaoLider, status: e.target.value })
              }
              style={inputStyle}
            >
              <option value="em_treinamento">Em treinamento</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Reprovado</option>
              <option value="pausado">Pausado</option>
              <option value="atencao">Atenção</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Observações da diretoria</label>
          <textarea
            value={avaliacaoLider.observacoes}
            onChange={(e) =>
              setAvaliacaoLider({
                ...avaliacaoLider,
                observacoes: e.target.value,
              })
            }
            placeholder="Pontos positivos, pontos a melhorar e orientações..."
            style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
          />
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(56,189,248,.25)",
            background: "rgba(14,165,233,.10)",
            color: "#cbd5e1",
          }}
        >
          <strong style={{ color: "#f8fafc" }}>Resumo da avaliação:</strong>
          <br />
          Líder: {avaliacaoLider.lider || "Não informado"} • Projeto:{" "}
          {avaliacaoLider.projeto || "Não informado"} • Nota:{" "}
          {avaliacaoLider.nota || "-"} • Status: {avaliacaoLider.status}
        </div>
      </div>
    </div>
  );

  const ProjectsPage = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={pageHeaderDarkStyle}>
        <div>
          <div style={breadcrumbDarkStyle}>Projetos › Detalhes do Projeto</div>
          <h1 style={pageTitleDarkStyle}>
            {projetoPainel?.Projeto || "Projetos"}
            {projetoPainel && (
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 14,
                  color: "#38bdf8",
                  background: "rgba(37,99,235,0.22)",
                  border: "1px solid rgba(56,189,248,0.18)",
                  padding: "8px 10px",
                  borderRadius: 10,
                  verticalAlign: "middle",
                }}
              >
                Projeto Ativo
              </span>
            )}
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setAbaProjeto("atividades")}
            style={botaoSecundarioStyle}
            title="Central de notificações da diretoria"
          >
            🔔 Notificações ({notificacoesProjeto.length})
          </button>
          {projetoPainel && (
            <button
              onClick={() => {
                setSelecionadoId(null);
                setRascunho(null);
                setAbaProjeto("informacoes");
              }}
              style={botaoSecundarioStyle}
            >
              Fechar visualização
            </button>
          )}
          {projetoPainel && usuarioLogado?.cargo === "diretoria" && (
            <button
              onClick={() =>
                alterarArquivamentoProjeto(!projetoPainel.Arquivado)
              }
              style={botaoSecundarioStyle}
            >
              {projetoPainel.Arquivado ? "Desarquivar" : "Arquivar"}
            </button>
          )}
          {podeCriarProjeto(usuarioLogado) && (
            <button
              onClick={() => {
                limparFormularioProjeto();
                setMostrarNovoProjeto(true);
              }}
              style={botaoPrimarioStyle}
            >
              Novo projeto
            </button>
          )}
          <button
            onClick={async () => {
              await recarregarProjetos();
              alert("Projetos atualizados.");
            }}
            style={botaoSecundarioStyle}
          >
            Atualizar
          </button>
        </div>
      </div>

      <div
        style={{
          ...painelDarkStyle,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 220px",
          gap: 12,
          padding: 14,
        }}
      >
        <input
          placeholder="Buscar por ID, projeto, líder, editor, gênero ou personagem..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={inputStyle}
        />
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          style={inputStyle}
        >
          <option>Todos</option>
          {statusUnicos.map((status, i) => (
            <option key={`${status}-${i}`}>{status}</option>
          ))}
        </select>
      </div>

      {!projetoPainel && ProjectList()}

      {!projetoPainel && (
        <div style={painelDarkStyle}>
          <h2 style={tituloCardDarkStyle}>Selecione um projeto</h2>
          <p style={{ color: "#94a3b8" }}>
            Clique em um projeto da lista acima para abrir a visualização.
          </p>
        </div>
      )}

      <div style={tabsDarkStyle}>
        {[
          ["informacoes", "ⓘ Informações"],
          ["elenco", "👥 Elenco"],
          ["registros", "▣ Registros Semanais"],
          ["drive", "📁 Arquivos do Drive"],
          ["atividades", "↔ Atividades"],
          ["historico", "◷ Histórico"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setAbaProjeto(id as any)}
            style={{
              ...tabButtonDarkStyle,
              background:
                abaProjeto === id ? "rgba(37,99,235,0.22)" : "transparent",
              color: abaProjeto === id ? "#38bdf8" : "#cbd5e1",
              borderBottom:
                abaProjeto === id
                  ? "2px solid #38bdf8"
                  : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {abaProjeto === "informacoes" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 0.95fr",
            gap: 18,
          }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            {ProjectDetails()}
            <div style={painelDarkStyle}>
              <h2 style={tituloCardDarkStyle}>▣ Observações</h2>
              <div
                style={{
                  background: "rgba(2,6,23,0.56)",
                  border: "1px solid rgba(148,163,184,0.14)",
                  borderRadius: 12,
                  minHeight: 84,
                  padding: 14,
                  color: "#f8fafc",
                  whiteSpace: "pre-wrap",
                }}
              >
                {projetoPainel?.Observacoes || "Sem observações cadastradas."}
              </div>
            </div>
          </div>
          {DrivePanel()}
        </div>
      )}

      {abaProjeto === "elenco" && (
        <div style={painelDarkStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={tituloCardDarkStyle}>
                Elenco e vídeos por personagem
              </h2>

              <p style={{ color: "#94a3b8" }}>
                Nesta área vamos guardar um link de vídeo/teste para cada
                personagem.
              </p>
            </div>

            {rascunho && podeEditarProjeto(usuarioLogado, projetoPainel) && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={adicionarElencoRascunho}
                  style={{
                    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                    border: "none",
                    color: "#fff",
                    borderRadius: 14,
                    padding: "12px 18px",
                    cursor: "pointer",
                    fontWeight: 800,
                    boxShadow: "0 0 25px rgba(37,99,235,.35)",
                  }}
                >
                  + Adicionar personagem
                </button>

                <button
                  type="button"
                  onClick={salvarElencoAtual}
                  style={{
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    border: "none",
                    color: "#fff",
                    borderRadius: 14,
                    padding: "12px 18px",
                    cursor: "pointer",
                    fontWeight: 800,
                    boxShadow: "0 0 25px rgba(34,197,94,.28)",
                  }}
                >
                  Salvar elenco
                </button>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            {((rascunho || projetoPainel)?.Elenco || []).length ? (
              (rascunho || projetoPainel)!.Elenco.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1.4fr",
                    gap: 12,
                    alignItems: "center",
                    background: "rgba(2,6,23,0.48)",
                    border: "1px solid rgba(148,163,184,0.12)",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>
                      Personagem
                    </div>
                    {rascunho &&
                    podeEditarProjeto(usuarioLogado, projetoPainel) ? (
                      <input
                        value={item.personagem || ""}
                        onChange={(e) =>
                          atualizarElencoRascunho(
                            index,
                            "personagem",
                            e.target.value
                          )
                        }
                        placeholder="Nome do personagem"
                        style={inputStyle}
                      />
                    ) : (
                      <div style={{ color: "#f8fafc", fontWeight: 900 }}>
                        {item.personagem || "-"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>
                      Dublador
                    </div>
                    {rascunho &&
                    podeEditarProjeto(usuarioLogado, projetoPainel) ? (
                      <input
                        value={item.dublador || ""}
                        onChange={(e) =>
                          atualizarElencoRascunho(
                            index,
                            "dublador",
                            e.target.value
                          )
                        }
                        placeholder="Nome do dublador"
                        style={inputStyle}
                      />
                    ) : (
                      <div style={{ color: "#f8fafc", fontWeight: 900 }}>
                        {item.dublador || "-"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>
                      Telefone do dublador
                    </div>
                    {rascunho &&
                    podeEditarProjeto(usuarioLogado, projetoPainel) ? (
                      <input
                        value={item.telefone_dublador || ""}
                        onChange={(e) =>
                          atualizarElencoRascunho(
                            index,
                            "telefone_dublador" as any,
                            e.target.value
                          )
                        }
                        placeholder="Número do dublador"
                        style={inputStyle}
                      />
                    ) : (
                      <div style={{ color: "#f8fafc", fontWeight: 900 }}>
                        {item.telefone_dublador || "-"}
                      </div>
                    )}
                  </div>

                  <input
                    placeholder="Link do vídeo/teste deste personagem"
                    value={(item as any).video_link || ""}
                    readOnly
                    style={inputStyle}
                  />

                  {rascunho &&
                    podeEditarProjeto(usuarioLogado, projetoPainel) && (
                      <button
                        type="button"
                        onClick={() => excluirElencoRascunho(item, index)}
                        style={{
                          marginTop: 10,
                          background: "rgba(220,38,38,0.15)",
                          border: "1px solid rgba(248,113,113,0.28)",
                          color: "#fca5a5",
                          borderRadius: 12,
                          padding: "10px 14px",
                          cursor: "pointer",
                          fontWeight: 800,
                        }}
                      >
                        Remover personagem
                      </button>
                    )}
                </div>
              ))
            ) : (
              <div style={{ color: "#94a3b8" }}>
                Nenhum elenco cadastrado neste projeto.
              </div>
            )}
          </div>
        </div>
      )}

      {abaProjeto === "drive" && <DrivePanel />}

      {abaProjeto === "registros" &&
        (projetoPainel ? (
          <div style={painelDarkStyle}>
            <h2 style={tituloCardDarkStyle}>
              ▣ Registros Semanais — {projetoPainel.Projeto}
            </h2>
            <p style={{ color: "#94a3b8", marginTop: 8 }}>
              Cada registro salvo recebe automaticamente nome, data e hora.
            </p>

            {(podeEditarProjeto(usuarioLogado, projetoPainel) ||
              usuarioLogado?.cargo === "diretoria" ||
              usuarioLogado?.cargo === "adm") && (
              <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
                <textarea
                  placeholder="Escreva o registro semanal do projeto..."
                  value={registroSemanalTexto}
                  onChange={(e) => setRegistroSemanalTexto(e.target.value)}
                  style={{ ...textareaStyle, minHeight: 110 }}
                />
                <button
                  onClick={salvarRegistroSemanalProjeto}
                  style={botaoPrimarioStyle}
                >
                  Salvar registro semanal
                </button>
              </div>
            )}

            <div
              style={{
                marginTop: 22,
                background: "rgba(2,6,23,0.54)",
                border: "1px solid rgba(148,163,184,0.14)",
                borderRadius: 14,
                padding: 16,
                color: "#cbd5e1",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {projetoPainel.Registro_Semanal ||
                "Nenhum registro semanal cadastrado."}
            </div>
          </div>
        ) : (
          <div style={painelDarkStyle}>
            <h2 style={tituloCardDarkStyle}>▣ Registros Semanais</h2>
            <p style={{ color: "#94a3b8" }}>
              Selecione um projeto para incluir ou visualizar registros.
            </p>
          </div>
        ))}

      {abaProjeto === "atividades" && (
        <div style={painelDarkStyle}>
          <h2 style={tituloCardDarkStyle}>🔔 Atividades do Projeto</h2>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>
            Aqui aparecem somente atividades vinculadas ao projeto selecionado e
            ao seu acesso.
          </p>
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {notificacoesProjeto.map((item, index) => (
              <div
                key={`${item.usuario}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
                  gap: 10,
                  background: "rgba(2,6,23,0.54)",
                  border: "1px solid rgba(56,189,248,0.14)",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div>
                  <strong style={{ color: "#f8fafc" }}>{item.usuario}</strong>
                  <span style={{ color: "#cbd5e1" }}> - {item.acao}</span>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                    {item.tipo}
                  </div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 13 }}>
                  {item.data}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {abaProjeto === "historico" &&
        (projetoPainel ? (
          <div style={painelDarkStyle}>
            <h2 style={tituloCardDarkStyle}>
              ◷ Histórico de Alterações — {projetoPainel.Projeto}
            </h2>
            <p style={{ color: "#94a3b8", marginTop: 8 }}>
              Histórico vinculado a este projeto. Toda ação salva fica
              registrada aqui com data, hora e usuário.
            </p>
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              {(projetoPainel.Registro_Semanal
                ? projetoPainel.Registro_Semanal.split("\n\n").filter(Boolean)
                : []
              ).map((item, index) => (
                <div
                  key={`${projetoPainel.ID}-historico-${index}`}
                  style={{
                    background: "rgba(2,6,23,0.54)",
                    border: "1px solid rgba(148,163,184,0.14)",
                    borderRadius: 14,
                    padding: 14,
                    color: "#cbd5e1",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item}
                </div>
              ))}
              {!projetoPainel.Registro_Semanal && (
                <div style={{ color: "#94a3b8" }}>
                  Nenhum histórico salvo para este projeto ainda.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={painelDarkStyle}>
            <h2 style={tituloCardDarkStyle}>◷ Histórico de Alterações</h2>
            <p style={{ color: "#94a3b8" }}>
              Selecione um projeto para visualizar o histórico dele.
            </p>
          </div>
        ))}

      {projetoPainel && ProjectList()}

      <div style={painelDarkStyle}>
        <h2 style={tituloCardDarkStyle}>Estatísticas do Projeto</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)",
            gap: 14,
            marginTop: 18,
          }}
        >
          <MiniStat
            icon="👥"
            value={String(projetoPainel?.Elenco.length || 0)}
            label="Membros no Elenco"
            color="#3b82f6"
          />
          <MiniStat
            icon="🎙️"
            value={String(projetoPainel?.Elenco.length || 0)}
            label="Vídeos/Testes"
            color="#8b5cf6"
          />
          <MiniStat
            icon="🎬"
            value={
              projetoPainel?.Status?.toLowerCase().includes("final")
                ? "01"
                : "00"
            }
            label="Episódios Finalizados"
            color="#22c55e"
          />
          <MiniStat
            icon="🕒"
            value={projetoPainel?.Registro_Semanal ? "01" : "00"}
            label="Registros Semanais"
            color="#f97316"
          />
          <MiniStat
            icon="📈"
            value="85%"
            label="Progresso Geral"
            color="#14b8a6"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 18% 0%, rgba(37,99,235,0.16), transparent 30%), radial-gradient(circle at 95% 12%, rgba(14,165,233,0.08), transparent 32%), #050816",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      <style>{estilosAnimacao}</style>

      <aside
        style={{
          width: isMobile ? "100%" : 250,
          minHeight: isMobile ? "auto" : "100vh",
          position: isMobile ? "relative" : "sticky",
          top: 0,
          alignSelf: "flex-start",
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.98), rgba(15,23,42,0.94))",
          borderRight: isMobile ? "none" : "1px solid rgba(148,163,184,0.16)",
          borderBottom: isMobile ? "1px solid rgba(148,163,184,0.16)" : "none",
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          alignItems: isMobile ? "center" : "stretch",
          overflowX: isMobile ? "auto" : "visible",
          padding: isMobile ? "12px 10px" : "28px 16px",
          gap: isMobile ? 10 : 22,
        }}
      >
        <div style={{ padding: isMobile ? 0 : "0 10px" }}>
          <img
            src={LOGO_URL}
            alt="DubWorks"
            style={{
              width: isMobile ? 58 : 150,
              height: "auto",
              filter: "drop-shadow(0 0 18px rgba(56,189,248,0.18))",
            }}
          />
          {!isMobile && (
            <div
              style={{
                color: "#38bdf8",
                fontWeight: 900,
                letterSpacing: 3,
                fontSize: 11,
                marginLeft: 58,
                marginTop: -8,
              }}
            >
              MANAGER
            </div>
          )}
        </div>

        <nav
          style={{
            display: isMobile ? "flex" : "grid",
            gap: 8,
            flex: isMobile ? 1 : undefined,
            overflowX: isMobile ? "auto" : "visible",
          }}
        >
          {!isMobile && <div style={sideSectionDarkStyle}>MENU</div>}
          <SidebarItem
            id="projetos"
            label={isMobile ? "" : "Projetos"}
            icon="▣"
            onClick={() => {
              setMostrarMembros(false);
              setMostrarUsuarios(false);
              setMostrarRelatorios(false);
              setMostrarFormNovoUsuario(false);
            }}
          />
          {temAcesso(usuarioLogado, "acesso_membros") && (
            <SidebarItem
              id="membros"
              label={isMobile ? "" : "Membros"}
              icon="👥"
              onClick={() => {
                setMostrarMembros(true);
                setMostrarUsuarios(false);
                setMostrarRelatorios(false);
                setMostrarFormNovoUsuario(false);
                recarregarMembros();
              }}
            />
          )}
          {temAcesso(usuarioLogado, "acesso_usuarios") && (
            <SidebarItem
              id="usuarios"
              label={isMobile ? "" : "Usuários"}
              icon="♙"
              onClick={() => {
                setMostrarUsuarios(true);
                setMostrarMembros(false);
                setMostrarRelatorios(false);
              }}
            />
          )}
          <SidebarItem
            id="relatorios"
            label={isMobile ? "" : "Relatórios"}
            icon="▥"
            onClick={() => {
              setMostrarRelatorios(true);
              setMostrarMembros(false);
              setMostrarUsuarios(false);
              setMostrarFormNovoUsuario(false);
            }}
          />
          {!isMobile && (
            <SidebarItem
              id="treinamentos"
              label="Treinamentos"
              icon="◇"
              onClick={abrirTelaTreinamentos}
            />
          )}
        </nav>

        <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
          {!isMobile && <div style={sideSectionDarkStyle}>CONFIGURAÇÕES</div>}
          {!isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 10px",
                color: "#cbd5e1",
              }}
            >
              <div style={{ ...avatarStyle, width: 44, height: 44 }}>
                {usuarioLogado.nome?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: "#f8fafc" }}>
                  {usuarioLogado.nome}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 13 }}>
                  {cargoLabel(usuarioLogado.cargo)}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={sair}
            style={{ ...menuTopoStyle, textAlign: "left" }}
          >
            {isMobile ? "⇢" : "⇢  Sair"}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: isMobile ? 14 : 26, minWidth: 0 }}>
        {telaAtual === "treinamentos"
          ? TrainingPage()
          : telaAtual === "membros"
          ? MembersPage()
          : telaAtual === "usuarios"
          ? UsersPage()
          : telaAtual === "relatorios"
          ? ReportsPage()
          : ProjectsPage()}
      </main>

      {mostrarNovoProjeto && (
        <Modal
          titulo="Novo projeto"
          onClose={() => {
            setMostrarNovoProjeto(false);
            limparFormularioProjeto();
          }}
          largo
        >
          <div style={{ display: "grid", gap: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                gap: 14,
              }}
            >
              {[
                ["Nome do projeto", "Projeto"],
                ["Tipo", "Tipo"],
                ["Gênero", "Genero"],
                ["Prioridade", "Prioridade"],
                ["Dupla", "Dupla"],
                ["Líder", "Lider"],
                ["Telefone do líder", "Telefone_Lider"],
                ["Editor", "Editor"],
                ["Telefone do editor", "Telefone_Editor"],
                ["Status", "Status"],
                ["Data de início", "Data_Inicio"],
                ["Capa do projeto (URL)", "Capa_URL"],
                ["Drive — Pasta principal", "Drive_Pasta_Link"],
                ["Drive — Vídeos dos personagens", "Drive_Videos_Link"],
                ["Drive — Cortes / Cenas", "Drive_Cortes_Link"],
                ["Drive — Finalizados", "Drive_Final_Link"],
              ].map(([label, campo]) => (
                <div key={campo}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    value={String((novoProjeto as any)[campo] || "")}
                    onChange={(e) =>
                      setNovoProjeto((anterior) => ({
                        ...anterior,
                        [campo]: e.target.value,
                      }))
                    }
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <div>
              <label style={labelStyle}>Observações</label>
              <textarea
                value={novoProjeto.Observacoes || ""}
                onChange={(e) =>
                  setNovoProjeto((anterior) => ({
                    ...anterior,
                    Observacoes: e.target.value,
                  }))
                }
                style={{ ...textareaStyle, minHeight: 100 }}
                placeholder="Observações iniciais do projeto..."
              />
            </div>

            <div style={painelDarkStyle}>
              <h3 style={{ ...tituloCardDarkStyle, marginBottom: 12 }}>
                Elenco inicial
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                <input
                  placeholder="Personagem"
                  value={novoElencoProjeto.personagem}
                  onChange={(e) =>
                    setNovoElencoProjeto((anterior) => ({
                      ...anterior,
                      personagem: e.target.value,
                    }))
                  }
                  style={inputStyle}
                />
                <input
                  placeholder="Dublador"
                  value={novoElencoProjeto.dublador}
                  onChange={(e) =>
                    setNovoElencoProjeto((anterior) => ({
                      ...anterior,
                      dublador: e.target.value,
                    }))
                  }
                  style={inputStyle}
                />
                <input
                  placeholder="Função"
                  value={novoElencoProjeto.funcao}
                  onChange={(e) =>
                    setNovoElencoProjeto((anterior) => ({
                      ...anterior,
                      funcao: e.target.value,
                    }))
                  }
                  style={inputStyle}
                />
                <button
                  onClick={adicionarElencoNovoProjeto}
                  style={botaoSecundarioStyle}
                >
                  Adicionar
                </button>
              </div>

              {novoProjeto.Elenco.length > 0 && (
                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  {novoProjeto.Elenco.map((item, index) => (
                    <div
                      key={item.id || index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        background: "rgba(2,6,23,0.54)",
                        border: "1px solid rgba(148,163,184,0.12)",
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <div>
                        <strong>{item.personagem}</strong>
                        <span style={{ color: "#94a3b8" }}>
                          {" "}
                          — {item.dublador}{" "}
                          {item.funcao ? `(${item.funcao})` : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => removerElencoNovoProjeto(item.id)}
                        style={botaoSecundarioStyle}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => {
                  setMostrarNovoProjeto(false);
                  limparFormularioProjeto();
                }}
                style={botaoSecundarioStyle}
              >
                Cancelar
              </button>
              <button onClick={criarProjeto} style={botaoPrimarioStyle}>
                Criar projeto
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const painelDarkStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(2,6,23,0.82))",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 24px 70px rgba(0,0,0,0.26)",
};

const painelHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  paddingBottom: 14,
  borderBottom: "1px solid rgba(148,163,184,0.12)",
};

const tituloCardDarkStyle: React.CSSProperties = {
  margin: 0,
  color: "#f8fafc",
  fontSize: 18,
  fontWeight: 900,
};

const pageHeaderDarkStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 4,
};

const breadcrumbDarkStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: 14,
  marginBottom: 10,
};

const pageTitleDarkStyle: React.CSSProperties = {
  margin: 0,
  color: "#f8fafc",
  fontSize: 32,
  lineHeight: 1.1,
  fontWeight: 900,
};

const tabsDarkStyle: React.CSSProperties = {
  display: "flex",
  overflowX: "auto",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: 14,
  background: "rgba(15,23,42,0.58)",
};

const tabButtonDarkStyle: React.CSSProperties = {
  border: "none",
  padding: "15px 22px",
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const tabelaHeaderDarkStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  color: "#e2e8f0",
  fontSize: 13,
  background: "rgba(15,23,42,0.68)",
  borderBottom: "1px solid rgba(148,163,184,0.14)",
};

const tabelaCellDarkStyle: React.CSSProperties = {
  padding: "14px 16px",
  color: "#cbd5e1",
  verticalAlign: "top",
};

const sideSectionDarkStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 11,
  letterSpacing: 1,
  fontWeight: 900,
  padding: "0 10px 6px",
};

const reportCardDarkStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(2,6,23,0.82))",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: 18,
  padding: 20,
  minHeight: 120,
  color: "#f8fafc",
  textAlign: "left",
  fontSize: 18,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 24px 70px rgba(0,0,0,0.26)",
};

function MenuCategoriaBloco({
  titulo,
  ativo,
  onClick,
  children,
}: {
  titulo: string;
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${ativo ? estilos.borda : "transparent"}`,
        borderRadius: 16,
        background: ativo ? "rgba(56,189,248,0.14)" : "rgba(15,23,42,0.96)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={ativo ? megaCategoriaAtivaStyle : megaCategoriaBotaoStyle}
      >
        <span>{titulo}</span>
        <span>{ativo ? "⌄" : "›"}</span>
      </button>

      {ativo && (
        <div
          style={{
            display: "grid",
            gap: 6,
            padding: "0 14px 14px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function SubmenuAcao({
  titulo,
  onClick,
}: {
  titulo: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} style={submenuAcaoStyle}>
      {titulo}
    </button>
  );
}

function MenuFerramentaItem({
  titulo,
  descricao,
  onClick,
}: {
  titulo: string;
  descricao: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={megaItemStyle}>
      <div style={{ fontWeight: 900, color: estilos.azulEscuro, fontSize: 18 }}>
        {titulo}
      </div>
      <div
        style={{ color: estilos.textoSuave, marginTop: 5, lineHeight: 1.35 }}
      >
        {descricao}
      </div>
    </button>
  );
}

function RelatorioCard({
  titulo,
  texto,
  botao,
  onClick,
}: {
  titulo: string;
  texto: string;
  botao: string;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        border: `1px solid ${estilos.borda}`,
        borderRadius: 18,
        padding: 22,
        background: "rgba(15, 23, 42, 0.82)",
        minHeight: 150,
        boxShadow: "0 12px 28px rgba(13, 71, 161, 0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 14,
      }}
    >
      <div>
        <div
          style={{ fontWeight: 900, color: estilos.azulEscuro, fontSize: 20 }}
        >
          {titulo}
        </div>
        <div
          style={{ color: estilos.textoSuave, marginTop: 8, lineHeight: 1.4 }}
        >
          {texto}
        </div>
      </div>
      <button onClick={onClick} style={botaoPrimarioStyle}>
        {botao}
      </button>
    </div>
  );
}

function AjudaCard({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div
      style={{
        border: `1px solid ${estilos.borda}`,
        borderRadius: 18,
        padding: 22,
        background: "rgba(15, 23, 42, 0.82)",
        minHeight: 130,
        boxShadow: "0 12px 28px rgba(13, 71, 161, 0.08)",
      }}
    >
      <div style={{ fontWeight: 900, color: estilos.azulEscuro, fontSize: 19 }}>
        {titulo}
      </div>
      <div
        style={{ color: estilos.textoSuave, marginTop: 8, lineHeight: 1.45 }}
      >
        {texto}
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          ...inputStyle,
          background: disabled ? "#f4f6f8" : "rgba(15,23,42,0.96)",
        }}
      />
    </div>
  );
}

function Modal({
  titulo,
  onClose,
  children,
  largo,
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
  largo?: boolean;
}) {
  return (
    <div style={overlayStyle}>
      <div
        style={{
          width: "100%",
          maxWidth: largo ? 980 : 860,
          background: "rgba(15, 23, 42, 0.82)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 30px 80px rgba(11, 61, 145, 0.25)",
          border: `1px solid ${estilos.borda}`,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 30, color: estilos.azulEscuro }}>
            {titulo}
          </h2>
          <button onClick={onClose} style={botaoSecundarioStyle}>
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div
      style={{
        ...cardStyle,
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.96))",
        border: "1px solid rgba(56,189,248,0.18)",
        boxShadow:
          "0 18px 42px rgba(0,0,0,0.32), 0 0 28px rgba(56,189,248,0.10)",
      }}
    >
      <div style={{ color: "#cbd5e1", fontSize: 15, marginBottom: 12 }}>
        {titulo}
      </div>
      <div style={{ fontSize: 40, fontWeight: 800, color: "#dbeafe" }}>
        {valor}
      </div>
    </div>
  );
}

function InfoPermissao({
  podeEditar,
  podeVideo,
}: {
  podeEditar: boolean;
  podeVideo: boolean;
}) {
  let texto = "Você só pode visualizar este projeto.";
  if (podeEditar) texto = "Você pode editar este projeto.";
  if (!podeEditar && podeVideo)
    texto =
      "Você pode visualizar este projeto e subir somente o vídeo do editor.";

  return (
    <div
      style={{
        marginBottom: 16,
        padding: 12,
        borderRadius: 14,
        background: "rgba(15,23,42,0.78)",
        border: `1px solid ${estilos.borda}`,
        color: estilos.texto,
        fontSize: 14,
        lineHeight: 1.6,
        fontWeight: 700,
      }}
    >
      {texto}
    </div>
  );
}

const estilosAnimacao = `
@keyframes dwFloat {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(0, -16px, 0) scale(1.025); }
}

@keyframes dwFadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes dwPulse {
  0%, 100% { transform: scale(1); opacity: 0.84; }
  50% { transform: scale(1.06); opacity: 1; }
}

@keyframes dwScan {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}

button, input, select, textarea {
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
}

button:hover {
  transform: translateY(-1px);
}

input::placeholder, textarea::placeholder {
  color: rgba(203, 213, 225, 0.56);
}

select {
  background: rgba(2, 6, 23, 0.88) !important;
  color: #f8fafc !important;
  border-color: rgba(148, 163, 184, 0.24) !important;
}

option {
  background: #020617;
  color: #f8fafc;
}

table {
  background: rgba(15, 23, 42, 0.86) !important;
  color: #f8fafc !important;
}

thead, tbody, tr, th, td {
  color: #f8fafc !important;
  border-color: rgba(148, 163, 184, 0.18) !important;
}

tr {
  transition: background .18s ease;
}

tr:hover {
  background: rgba(56, 189, 248, 0.08) !important;
}

* {
  scrollbar-color: rgba(56, 189, 248, .55) rgba(15, 23, 42, .85);
}
`;

const cardStyle: React.CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.94))",
  border: `1px solid ${estilos.borda}`,
  borderRadius: 22,
  padding: 18,
  boxShadow:
    "0 18px 45px rgba(0, 0, 0, 0.30), 0 0 28px rgba(56, 189, 248, 0.08)",
  backdropFilter: "blur(14px)",
  animation: "dwFadeUp .45s ease both",
};

const secaoTituloStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: estilos.azulEscuro,
  marginBottom: 14,
};

const thStyle: React.CSSProperties = {
  padding: "15px 14px",
  fontSize: 14,
  color: estilos.azulEscuro,
  borderBottom: `1px solid ${estilos.borda}`,
};

const tdStyle: React.CSSProperties = {
  padding: "15px 14px",
  fontSize: 14,
  verticalAlign: "top",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 7,
  fontSize: 13,
  fontWeight: 700,
  color: estilos.textoSuave,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 13,
  borderRadius: 14,
  border: `1px solid ${estilos.borda}`,
  background: "rgba(2, 6, 23, 0.88)",
  color: estilos.texto,
  fontSize: 15,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 13,
  borderRadius: 14,
  border: `1px solid ${estilos.borda}`,
  background: "rgba(2, 6, 23, 0.88)",
  color: estilos.texto,
  fontSize: 15,
  resize: "vertical",
  outline: "none",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(8, 33, 79, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  zIndex: 40,
};

const submenuAcaoStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "rgba(15, 23, 42, 0.82)",
  color: estilos.texto,
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const menuTopoStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: estilos.texto,
  fontWeight: 800,
  cursor: "pointer",
  padding: "10px 8px",
  fontSize: 15,
};

const avatarStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #dbeafe, #1366d9)",
  color: "rgba(15,23,42,0.96)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 18,
  boxShadow: "0 8px 20px rgba(19, 102, 217, 0.20)",
};

const megaCategoriaStyle: React.CSSProperties = {
  padding: "18px 22px",
  borderRadius: 14,
  fontWeight: 900,
  color: estilos.texto,
  background: "rgba(15, 23, 42, 0.88)",
  border: `1px solid ${estilos.borda}`,
};

const megaCategoriaBotaoStyle: React.CSSProperties = {
  ...megaCategoriaStyle,
  textAlign: "left",
  cursor: "pointer",
};

const megaCategoriaAtivaStyle: React.CSSProperties = {
  ...megaCategoriaBotaoStyle,
  color: estilos.azul,
  background: "rgba(59, 130, 246, 0.16)",
};

const megaItemStyle: React.CSSProperties = {
  textAlign: "left",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: "14px 4px",
};

const botaoPrimarioStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #dbeafe, #1366d9)",
  color: "rgba(15,23,42,0.96)",
  border: "none",
  borderRadius: 14,
  padding: "11px 16px",
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 8px 20px rgba(19, 102, 217, 0.22)",
};

const botaoPrimarioStyleGrande: React.CSSProperties = {
  width: "100%",
  background: "linear-gradient(135deg, #dbeafe, #1366d9)",
  color: "rgba(15,23,42,0.96)",
  border: "none",
  borderRadius: 16,
  padding: 16,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(19, 102, 217, 0.22)",
};

const botaoSecundarioStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.72)",
  border: `1px solid ${estilos.borda}`,
  borderRadius: 14,
  padding: "11px 15px",
  cursor: "pointer",
  fontWeight: 700,
  color: estilos.azulEscuro,
};

const botaoSecundarioGrandeStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.72)",
  border: `1px solid ${estilos.borda}`,
  borderRadius: 14,
  padding: 14,
  cursor: "pointer",
  fontWeight: 700,
  color: estilos.azulEscuro,
};
