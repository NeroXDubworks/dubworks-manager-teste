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
  funcao: string;
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
  azul: "#175cd3",
  azulEscuro: "#0d47a1",
  azulClaro: "#eef5ff",
  borda: "#d7e4f7",
  texto: "#183153",
  textoSuave: "#667085",
  fundo: "#f4f8fd",
  branco: "#ffffff",
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
  if (s === "na_comunidade") return { bg: "#e7f8ef", color: "#087443" };
  if (s === "saiu") return { bg: "#fff4e5", color: "#b45309" };
  if (s === "banido") return { bg: "#fff1f0", color: "#c2410c" };
  return { bg: "#eef4ff", color: "#3657c8" };
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
    return { bg: "#e7f8ef", color: "#087443" };
  }
  if (s.indexOf("exec") !== -1 || s.indexOf("andamento") !== -1) {
    return { bg: "#eaf2ff", color: "#1456d9" };
  }
  if (s.indexOf("interromp") !== -1 || s.indexOf("paus") !== -1) {
    return { bg: "#fff1f0", color: "#c2410c" };
  }
  if (s.indexOf("stand") !== -1) {
    return { bg: "#eef4ff", color: "#3657c8" };
  }
  return { bg: "#f3f6fb", color: "#475467" };
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
        observacoes: projeto.Observacoes,
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
      observacoes: projeto.Observacoes,
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
  const [mostrarMembros, setMostrarMembros] = useState(false);
  const [mostrarFerramentas, setMostrarFerramentas] = useState(false);
  const [categoriaFerramentas, setCategoriaFerramentas] = useState<
    "consultas" | "servicos" | "relatorios" | "financeiro"
  >("consultas");
  const [mostrarCentralAjuda, setMostrarCentralAjuda] = useState(false);
  const [mostrarRelatorios, setMostrarRelatorios] = useState(false);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [queryMembros, setQueryMembros] = useState("");
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
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email?.trim().toLowerCase();

      await recarregarProjetos();
      await recarregarUsuarios();

      if (!email) {
        setUsuarioLogado(null);
        return;
      }

      const perfil = await buscarPerfilPorEmail(email);
      if (perfil) {
        setUsuarioLogado(perfil);
        if (podeGerenciarMembros(perfil)) {
          carregarMembrosBanco()
            .then(setMembros)
            .catch((err) => console.error("Erro ao carregar membros:", err));
        }
      }
    }

    async function aoVoltarParaTela() {
      if (document.visibilityState === "visible") {
        await restaurarSessaoERecarregar();
      }
    }

    restaurarSessaoERecarregar();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        const email = session?.user?.email?.trim().toLowerCase();
        if (!email) {
          setUsuarioLogado(null);
          return;
        }
        const perfil = await buscarPerfilPorEmail(email);
        if (perfil) {
          setUsuarioLogado(perfil);
          if (podeGerenciarMembros(perfil)) {
            carregarMembrosBanco()
              .then(setMembros)
              .catch((err) => console.error("Erro ao carregar membros:", err));
          }
        }
      }
    );

    document.addEventListener("visibilitychange", aoVoltarParaTela);
    window.addEventListener("focus", aoVoltarParaTela);

    return () => {
      listener.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", aoVoltarParaTela);
      window.removeEventListener("focus", aoVoltarParaTela);
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

    const projetoId = await criarProjetoBanco(projetoParaSalvar);
    if (!projetoId) {
      alert("Erro ao salvar no banco.");
      return;
    }

    const elencoOk = await salvarElencoProjetoBanco(
      projetoId,
      projetoParaSalvar.Elenco
    );

    if (!elencoOk) alert("Projeto salvo, mas houve erro ao salvar o elenco.");

    await recarregarProjetos();
    setMostrarNovoProjeto(false);
    limparFormularioProjeto();
    setSelecionadoId(projetoId);
    alert("Projeto salvo no banco 🚀");
  }

  async function salvarAlteracoes() {
    if (!rascunho || !selecionado || !usuarioLogado) return;

    const podeEditar = podeEditarProjeto(usuarioLogado, selecionado);
    const podeVideo = podeSubirVideoEditor(usuarioLogado, selecionado);
    if (!podeEditar && !podeVideo) return;

    if (!podeEditar && podeVideo) {
      const projetoVideo: Projeto = {
        ...selecionado,
        Video_Editor_Link: rascunho.Video_Editor_Link || "",
        Observacoes: rascunho.Observacoes || "",
      };

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

    const projetoOk = await atualizarProjetoBanco(projetoFinal);
    if (!projetoOk) {
      alert("Erro ao salvar o projeto no banco.");
      return;
    }

    const elencoOk = await salvarElencoProjetoBanco(
      projetoFinal.ID,
      projetoFinal.Elenco
    );
    if (!elencoOk) {
      alert("Projeto salvo, mas houve erro ao salvar o elenco.");
      return;
    }

    await recarregarProjetos();
    alert("Alterações salvas com sucesso.");
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

  function adicionarElencoRascunho() {
    if (!rascunho) return;
    if (
      !novoElencoRascunho.personagem.trim() ||
      !novoElencoRascunho.dublador.trim()
    ) {
      alert("Preencha personagem e dublador.");
      return;
    }

    setRascunho({
      ...rascunho,
      Elenco: [
        ...rascunho.Elenco,
        { ...novoElencoRascunho, id: gerarIdTemporario() },
      ],
    });

    setNovoElencoRascunho(elencoVazio);
  }

  function removerElencoRascunho(id: string) {
    if (!rascunho) return;
    setRascunho({
      ...rascunho,
      Elenco: rascunho.Elenco.filter((item) => item.id !== id),
    });
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
          background:
            "linear-gradient(180deg, #0f3c8d 0%, #1456d9 45%, #f4f8fd 45%, #f4f8fd 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: isMobile ? "flex-start" : "center",
          padding: isMobile ? 14 : 24,
          paddingTop: isMobile ? 26 : 24,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isMobile ? "100%" : 520,
            background: "#fff",
            borderRadius: 28,
            boxShadow: "0 30px 80px rgba(6, 31, 75, 0.22)",
            overflow: "hidden",
            border: "1px solid #dbe7f7",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0d47a1, #1366d9)",
              padding: isMobile ? 22 : 28,
              color: "#fff",
            }}
          >
            <img
              src={LOGO_URL}
              alt="DubWorks"
              style={{
                width: 150,
                height: "auto",
                display: "block",
                marginBottom: 14,
              }}
            />
            <h1 style={{ margin: 0, fontSize: isMobile ? 28 : 34 }}>
              DubWorks Manager
            </h1>
            <p style={{ marginTop: 8, opacity: 0.9, fontSize: 15 }}>
              Acesso interno de gerenciamento
            </p>
          </div>

          <form onSubmit={fazerLogin} style={{ padding: isMobile ? 20 : 28 }}>
            <label style={labelStyle}>E-mail</label>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Digite seu e-mail"
              style={{ ...inputStyle, marginBottom: 16 }}
            />

            <label style={labelStyle}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              style={{ ...inputStyle, marginBottom: 16 }}
            />

            {erroLogin && (
              <div
                style={{
                  background: "#fff2f0",
                  color: "#c2410c",
                  border: "1px solid #ffd7cc",
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                {erroLogin}
              </div>
            )}

            <button
              type="submit"
              disabled={carregandoLogin}
              style={botaoPrimarioStyleGrande}
            >
              {carregandoLogin ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={enviarRecuperacaoSenha}
              style={{
                marginTop: 12,
                background: "transparent",
                border: "none",
                color: estilos.azulEscuro,
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
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: estilos.fundo,
        fontFamily: "Arial, sans-serif",
        color: estilos.texto,
      }}
    >
      <header
        style={{
          background: estilos.branco,
          borderBottom: `1px solid ${estilos.borda}`,
          padding: isMobile ? "8px 10px" : "8px 18px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 8 : 12,
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isMobile ? 8 : 18,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 8 : 14,
              minWidth: 0,
              flex: 1,
            }}
          >
            <img
              src={LOGO_URL}
              alt="DubWorks"
              style={{
                width: isMobile ? 62 : 96,
                height: "auto",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: isMobile ? 16 : 22,
                  fontWeight: 800,
                  color: estilos.azulEscuro,
                  lineHeight: 1.05,
                }}
              >
                DubWorks Manager
              </div>
              {isMobile ? (
                <div
                  style={{
                    color: estilos.textoSuave,
                    marginTop: 3,
                    fontSize: 12,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 180,
                  }}
                >
                  {usuarioLogado.nome} • {cargoLabel(usuarioLogado.cargo)}
                </div>
              ) : (
                <div
                  style={{
                    color: estilos.textoSuave,
                    marginTop: 3,
                    fontSize: 13,
                  }}
                >
                  Acesso interno de gerenciamento
                </div>
              )}
            </div>
          </div>

          {isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                textAlign: "right",
              }}
            >
              <div
                style={{
                  ...avatarStyle,
                  width: 40,
                  height: 40,
                  fontSize: 16,
                }}
              >
                {usuarioLogado.nome?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "flex-start" : "flex-end",
            gap: isMobile ? 6 : 14,
            flexWrap: isMobile ? "nowrap" : "wrap",
            width: isMobile ? "100%" : "auto",
            flex: isMobile ? undefined : 1,
            overflowX: isMobile ? "auto" : "visible",
            paddingBottom: isMobile ? 2 : 0,
          }}
        >
          <button
            onClick={() => {
              setMostrarFerramentas(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{
              ...menuTopoStyle,
              fontSize: isMobile ? 13 : 15,
              padding: isMobile ? "7px 7px" : undefined,
            }}
          >
            Home
          </button>

          <button
            onClick={() => setMostrarFerramentas((valor) => !valor)}
            style={{
              ...menuTopoStyle,
              color: mostrarFerramentas ? estilos.azul : estilos.texto,
              fontSize: isMobile ? 13 : 15,
              padding: isMobile ? "7px 7px" : undefined,
            }}
          >
            Ferramentas
          </button>

          <button
            onClick={() => {
              setMostrarFerramentas(false);
              setMostrarCentralAjuda(true);
            }}
            style={{
              ...menuTopoStyle,
              fontSize: isMobile ? 13 : 15,
              padding: isMobile ? "7px 7px" : undefined,
            }}
          >
            Ajuda
          </button>

          {podeCriarProjeto(usuarioLogado) && (
            <button
              onClick={() => {
                setMostrarFerramentas(false);
                limparFormularioProjeto();
                setMostrarNovoProjeto(true);
              }}
              style={{
                ...botaoPrimarioStyle,
                padding: isMobile ? "9px 12px" : botaoPrimarioStyle.padding,
                fontSize: isMobile ? 14 : 16,
                borderRadius: isMobile ? 14 : botaoPrimarioStyle.borderRadius,
              }}
            >
              Novo projeto
            </button>
          )}

          <button
            onClick={sair}
            style={{
              ...botaoSecundarioStyle,
              padding: isMobile ? "8px 10px" : "10px 16px",
              fontSize: isMobile ? 13 : 15,
              borderRadius: isMobile ? 13 : botaoSecundarioStyle.borderRadius,
              whiteSpace: "nowrap",
            }}
          >
            Sair
          </button>

          {!isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "right",
                marginLeft: 8,
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, lineHeight: 1.1 }}>
                  {usuarioLogado.nome}
                </div>
                <div style={{ color: estilos.textoSuave, fontSize: 13 }}>
                  {cargoLabel(usuarioLogado.cargo)}
                </div>
              </div>
              <div
                style={{
                  ...avatarStyle,
                  width: 44,
                  height: 44,
                  fontSize: 18,
                }}
              >
                {usuarioLogado.nome?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          )}
        </div>

        {mostrarFerramentas && (
          <div
            style={{
              position: isMobile ? "static" : "absolute",
              left: 0,
              right: 0,
              top: "100%",
              background: "#fff",
              borderTop: `1px solid ${estilos.borda}`,
              borderBottom: `1px solid ${estilos.borda}`,
              boxShadow: "0 24px 55px rgba(13, 71, 161, 0.14)",
              padding: isMobile ? 14 : "28px 42px",
              zIndex: 31,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "280px 1fr",
                gap: isMobile ? 16 : 36,
                maxWidth: 1180,
                margin: "0 auto",
              }}
            >
              <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                <MenuCategoriaBloco
                  titulo="Consultas"
                  ativo={categoriaFerramentas === "consultas"}
                  onClick={() => setCategoriaFerramentas("consultas")}
                >
                  {temAcesso(usuarioLogado, "acesso_projetos") && (
                    <SubmenuAcao
                      titulo="Projetos"
                      onClick={() => {
                        setMostrarFerramentas(false);
                        window.scrollTo({ top: 360, behavior: "smooth" });
                      }}
                    />
                  )}
                  {temAcesso(usuarioLogado, "acesso_membros") && (
                    <SubmenuAcao
                      titulo="Membros"
                      onClick={() => {
                        setMostrarFerramentas(false);
                        setMostrarMembros(true);
                        recarregarMembros();
                      }}
                    />
                  )}
                  {temAcesso(usuarioLogado, "acesso_usuarios") && (
                    <SubmenuAcao
                      titulo="Usuários"
                      onClick={() => {
                        setMostrarFerramentas(false);
                        setMostrarUsuarios(true);
                      }}
                    />
                  )}
                  {temAcesso(usuarioLogado, "acesso_treinamentos") && (
                    <SubmenuAcao
                      titulo="Líderes em treinamento"
                      onClick={() => {
                        setMostrarFerramentas(false);
                        setMostrarUsuarios(true);
                      }}
                    />
                  )}
                </MenuCategoriaBloco>

                <MenuCategoriaBloco
                  titulo="Serviços"
                  ativo={categoriaFerramentas === "servicos"}
                  onClick={() => setCategoriaFerramentas("servicos")}
                >
                  {podeCriarProjeto(usuarioLogado) && (
                    <SubmenuAcao
                      titulo="Novo projeto"
                      onClick={() => {
                        setMostrarFerramentas(false);
                        limparFormularioProjeto();
                        setMostrarNovoProjeto(true);
                      }}
                    />
                  )}
                  {temAcesso(usuarioLogado, "acesso_projetos") && (
                    <SubmenuAcao
                      titulo={
                        mostrarArquivados
                          ? "Ver projetos ativos"
                          : "Projetos arquivados"
                      }
                      onClick={() => {
                        setMostrarFerramentas(false);
                        setMostrarArquivados(!mostrarArquivados);
                        setSelecionadoId(null);
                        setRascunho(null);
                      }}
                    />
                  )}
                  <SubmenuAcao
                    titulo="Central de ajuda"
                    onClick={() => {
                      setMostrarFerramentas(false);
                      setMostrarCentralAjuda(true);
                    }}
                  />
                </MenuCategoriaBloco>

                <MenuCategoriaBloco
                  titulo="Relatórios"
                  ativo={categoriaFerramentas === "relatorios"}
                  onClick={() => setCategoriaFerramentas("relatorios")}
                >
                  <SubmenuAcao
                    titulo="Painel de relatórios"
                    onClick={() => {
                      setMostrarFerramentas(false);
                      setMostrarRelatorios(true);
                    }}
                  />
                  {temAcesso(usuarioLogado, "acesso_relatorios_projetos") && (
                    <SubmenuAcao
                      titulo="Exportar projetos"
                      onClick={() => {
                        setMostrarFerramentas(false);
                        exportarProjetosCSV();
                      }}
                    />
                  )}
                  {temAcesso(usuarioLogado, "acesso_relatorios_elenco") && (
                    <SubmenuAcao
                      titulo="Exportar elenco"
                      onClick={() => {
                        setMostrarFerramentas(false);
                        exportarElencoCSV();
                      }}
                    />
                  )}
                  {temAcesso(usuarioLogado, "acesso_relatorios_membros") && (
                    <SubmenuAcao
                      titulo="Exportar membros"
                      onClick={() => {
                        setMostrarFerramentas(false);
                        exportarMembrosCSV();
                      }}
                    />
                  )}
                  {temAcesso(
                    usuarioLogado,
                    "acesso_relatorios_entrada_saida"
                  ) && (
                    <SubmenuAcao
                      titulo="Entrada e saída"
                      onClick={() => {
                        setMostrarFerramentas(false);
                        exportarRelatorioEntradaSaidaCSV();
                      }}
                    />
                  )}
                </MenuCategoriaBloco>

                <MenuCategoriaBloco
                  titulo="Financeiro"
                  ativo={categoriaFerramentas === "financeiro"}
                  onClick={() => setCategoriaFerramentas("financeiro")}
                >
                  <SubmenuAcao
                    titulo="Financeiro DubWorks"
                    onClick={() =>
                      alert("Área financeira reservada para uma próxima etapa.")
                    }
                  />
                  <SubmenuAcao
                    titulo="Dashboard financeiro"
                    onClick={() =>
                      alert("Dashboard financeiro ainda será desenvolvido.")
                    }
                  />
                </MenuCategoriaBloco>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "repeat(2, minmax(0, 1fr))",
                  gap: isMobile ? 14 : 24,
                  alignContent: "start",
                }}
              >
                {categoriaFerramentas === "consultas" && (
                  <>
                    {temAcesso(usuarioLogado, "acesso_projetos") && (
                      <MenuFerramentaItem
                        titulo="Projetos"
                        descricao="Voltar para a lista e edição dos projetos ativos."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          window.scrollTo({ top: 360, behavior: "smooth" });
                        }}
                      />
                    )}
                    {temAcesso(usuarioLogado, "acesso_membros") && (
                      <MenuFerramentaItem
                        titulo="Membros"
                        descricao="Consultar nomes, telefones, status e histórico da comunidade."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          setMostrarMembros(true);
                          recarregarMembros();
                        }}
                      />
                    )}
                    {temAcesso(usuarioLogado, "acesso_usuarios") && (
                      <MenuFerramentaItem
                        titulo="Usuários"
                        descricao="Gerenciar acessos, cargos, vínculos e permissões."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          setMostrarUsuarios(true);
                        }}
                      />
                    )}
                    {temAcesso(usuarioLogado, "acesso_treinamentos") && (
                      <MenuFerramentaItem
                        titulo="Líderes em treinamento"
                        descricao="Acompanhar status e concluir treinamentos de líderes."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          setMostrarUsuarios(true);
                        }}
                      />
                    )}
                  </>
                )}

                {categoriaFerramentas === "servicos" && (
                  <>
                    {podeCriarProjeto(usuarioLogado) && (
                      <MenuFerramentaItem
                        titulo="Novo projeto"
                        descricao="Cadastrar projeto, líder, editor, status, capa e elenco inicial."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          limparFormularioProjeto();
                          setMostrarNovoProjeto(true);
                        }}
                      />
                    )}
                    {temAcesso(usuarioLogado, "acesso_projetos") && (
                      <MenuFerramentaItem
                        titulo={
                          mostrarArquivados
                            ? "Ver projetos ativos"
                            : "Projetos arquivados"
                        }
                        descricao="Alternar entre a lista de projetos ativos e arquivados."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          setMostrarArquivados(!mostrarArquivados);
                          setSelecionadoId(null);
                          setRascunho(null);
                        }}
                      />
                    )}
                    <MenuFerramentaItem
                      titulo="Central de ajuda"
                      descricao="Abrir os atalhos e tutoriais internos do sistema."
                      onClick={() => {
                        setMostrarFerramentas(false);
                        setMostrarCentralAjuda(true);
                      }}
                    />
                  </>
                )}

                {categoriaFerramentas === "relatorios" && (
                  <>
                    <MenuFerramentaItem
                      titulo="Painel de relatórios"
                      descricao="Escolher entre relatório de projetos, elenco, membros ou entrada/saída."
                      onClick={() => {
                        setMostrarFerramentas(false);
                        setMostrarRelatorios(true);
                      }}
                    />
                    {temAcesso(usuarioLogado, "acesso_relatorios_projetos") && (
                      <MenuFerramentaItem
                        titulo="Relatório de projetos"
                        descricao="Exportar a lista filtrada de projetos."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          exportarProjetosCSV();
                        }}
                      />
                    )}
                    {temAcesso(usuarioLogado, "acesso_relatorios_elenco") && (
                      <MenuFerramentaItem
                        titulo="Relatório de elenco"
                        descricao="Exportar personagens, dubladores e ranking."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          exportarElencoCSV();
                        }}
                      />
                    )}
                    {temAcesso(usuarioLogado, "acesso_relatorios_membros") && (
                      <MenuFerramentaItem
                        titulo="Relatório de membros"
                        descricao="Exportar nomes, telefones, status e observações."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          exportarMembrosCSV();
                        }}
                      />
                    )}
                    {temAcesso(
                      usuarioLogado,
                      "acesso_relatorios_entrada_saida"
                    ) && (
                      <MenuFerramentaItem
                        titulo="Entrada e saída"
                        descricao="Exportar crescimento mensal da comunidade."
                        onClick={() => {
                          setMostrarFerramentas(false);
                          exportarRelatorioEntradaSaidaCSV();
                        }}
                      />
                    )}
                  </>
                )}

                {categoriaFerramentas === "financeiro" && (
                  <>
                    <MenuFerramentaItem
                      titulo="Financeiro DubWorks"
                      descricao="Área reservada para controle futuro de gastos, TikTok e monetização."
                      onClick={() =>
                        alert(
                          "Área financeira reservada para uma próxima etapa."
                        )
                      }
                    />
                    <MenuFerramentaItem
                      titulo="Dashboard financeiro"
                      descricao="Em breve: receitas, despesas, equipamentos e prestação de contas."
                      onClick={() =>
                        alert("Dashboard financeiro ainda será desenvolvido.")
                      }
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main style={{ padding: isMobile ? 12 : 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <ResumoCard
            titulo="Total de projetos"
            valor={String(totalProjetos)}
          />
          <ResumoCard titulo="Projetos ativos" valor={String(totalAtivos)} />
          <ResumoCard titulo="Finalizados" valor={String(totalFinalizados)} />
          <ResumoCard
            titulo="Registros de elenco"
            valor={String(totalElenco)}
          />
          {podeGerenciarMembros(usuarioLogado) && (
            <ResumoCard
              titulo="Membros ativos"
              valor={String(totalMembrosAtivos)}
            />
          )}
          {podeGerenciarTreinamentos(usuarioLogado) && (
            <ResumoCard
              titulo="Líderes em treinamento"
              valor={String(totalTreinamento)}
            />
          )}
        </div>

        <div
          style={{
            ...cardStyle,
            marginBottom: 18,
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
              ? "1fr 1fr"
              : "1.4fr 220px 170px 170px 170px",
            gap: 12,
            alignItems: "center",
          }}
        >
          <input
            placeholder="Buscar por ID, projeto, líder, editor, gênero, personagem..."
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
              <option key={i}>{status}</option>
            ))}
          </select>

          <button
            onClick={() => {
              const novoValor = !mostrarArquivados;
              setMostrarArquivados(novoValor);
              setSelecionadoId(null);
              setRascunho(null);
            }}
            style={botaoSecundarioGrandeStyle}
          >
            {mostrarArquivados ? "Ver ativos" : "Arquivados"}
          </button>

          <button
            onClick={exportarProjetosCSV}
            style={botaoSecundarioGrandeStyle}
          >
            Relatório
          </button>

          <button
            onClick={recarregarProjetos}
            style={botaoSecundarioGrandeStyle}
          >
            Atualizar
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "1.45fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 18px",
                borderBottom: `1px solid ${estilos.borda}`,
                background: "linear-gradient(180deg, #f8fbff, #f1f6ff)",
                fontWeight: 800,
                color: estilos.azulEscuro,
                fontSize: 20,
              }}
            >
              {mostrarArquivados ? "Projetos arquivados" : "Projetos ativos"}{" "}
              {carregando ? "• carregando..." : ""}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 980,
                }}
              >
                <thead>
                  <tr style={{ textAlign: "left", background: "#f8fbff" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Projeto</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Gênero</th>
                    <th style={thStyle}>Prioridade</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Líder</th>
                    <th style={thStyle}>Editor</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => {
                    const ativo = p.ID === selecionadoId;
                    const statusCor = corStatus(p.Status);

                    return (
                      <tr
                        key={p.ID}
                        onClick={() => setSelecionadoId(p.ID)}
                        style={{
                          cursor: "pointer",
                          background: ativo ? "#eef5ff" : "#fff",
                          borderTop: `1px solid ${estilos.borda}`,
                        }}
                      >
                        <td style={tdStyle}>{p.ID}</td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700 }}>{p.Projeto}</div>
                          <div
                            style={{ color: estilos.textoSuave, fontSize: 13 }}
                          >
                            {p.Elenco.length} registro(s) de elenco
                          </div>
                        </td>
                        <td style={tdStyle}>{p.Tipo}</td>
                        <td style={tdStyle}>{p.Genero}</td>
                        <td style={tdStyle}>{p.Prioridade}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "7px 12px",
                              borderRadius: 999,
                              background: statusCor.bg,
                              color: statusCor.color,
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {p.Status}
                          </span>
                        </td>
                        <td style={tdStyle}>{p.Lider}</td>
                        <td style={tdStyle}>{p.Editor}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ ...cardStyle, minHeight: 460 }}>
              {!rascunho ? (
                <div style={{ color: estilos.textoSuave, fontSize: 17 }}>
                  Selecione um projeto para ver e editar.
                </div>
              ) : (
                <>
                  {rascunho.Capa_URL ? (
                    <img
                      src={rascunho.Capa_URL}
                      alt={`Capa do projeto ${rascunho.Projeto}`}
                      style={{
                        width: "100%",
                        height: 190,
                        objectFit: "cover",
                        borderRadius: 18,
                        border: `1px solid ${estilos.borda}`,
                        marginBottom: 16,
                        background: "#eef5ff",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 150,
                        borderRadius: 18,
                        border: `1px solid ${estilos.borda}`,
                        marginBottom: 16,
                        background: "linear-gradient(135deg, #0d47a1, #1366d9)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 22,
                        textAlign: "center",
                        padding: 18,
                      }}
                    >
                      {rascunho.Projeto || "DubWorks"}
                    </div>
                  )}

                  <div
                    style={{
                      paddingBottom: 14,
                      marginBottom: 18,
                      borderBottom: `1px solid ${estilos.borda}`,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 30,
                        color: estilos.azulEscuro,
                      }}
                    >
                      {rascunho.Projeto || "Projeto"}
                    </h2>
                    <div style={{ marginTop: 8, color: estilos.textoSuave }}>
                      ID: {rascunho.ID}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <strong>Líder:</strong> {rascunho.Lider || "-"}
                    </div>
                  </div>

                  <InfoPermissao
                    podeEditar={podeEditarProjeto(usuarioLogado, selecionado)}
                    podeVideo={podeSubirVideoEditor(usuarioLogado, selecionado)}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Campo
                      label="Projeto"
                      value={rascunho.Projeto}
                      onChange={(v) => atualizarCampo("Projeto", v)}
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                    />
                    <Campo
                      label="Tipo"
                      value={rascunho.Tipo}
                      onChange={(v) => atualizarCampo("Tipo", v)}
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                    />
                    <Campo
                      label="Gênero"
                      value={rascunho.Genero}
                      onChange={(v) => atualizarCampo("Genero", v)}
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                    />
                    <Campo
                      label="Prioridade"
                      value={rascunho.Prioridade}
                      onChange={(v) => atualizarCampo("Prioridade", v)}
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                    />
                    <Campo
                      label="Dupla"
                      value={rascunho.Dupla}
                      onChange={(v) => atualizarCampo("Dupla", v)}
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                    />
                    <Campo
                      label="Status"
                      value={rascunho.Status}
                      onChange={(v) => atualizarCampo("Status", v)}
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                    />
                    <Campo
                      label="Líder"
                      value={rascunho.Lider}
                      onChange={(v) => atualizarCampo("Lider", v)}
                      disabled={
                        ["diretoria", "adm"].indexOf(usuarioLogado.cargo) === -1
                      }
                    />
                    <Campo
                      label="Telefone do líder"
                      value={rascunho.Telefone_Lider}
                      onChange={(v) => atualizarCampo("Telefone_Lider", v)}
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                    />
                    <Campo
                      label="Editor"
                      value={rascunho.Editor}
                      onChange={(v) => atualizarCampo("Editor", v)}
                      disabled={
                        ["diretoria", "adm"].indexOf(usuarioLogado.cargo) === -1
                      }
                    />
                    <Campo
                      label="Telefone do editor"
                      value={rascunho.Telefone_Editor}
                      onChange={(v) => atualizarCampo("Telefone_Editor", v)}
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                    />
                    <Campo
                      label="Data de início"
                      value={rascunho.Data_Inicio}
                      onChange={(v) => atualizarCampo("Data_Inicio", v)}
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                    />
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Campo
                        label="Link da capa do projeto"
                        value={rascunho.Capa_URL}
                        onChange={(v) => atualizarCampo("Capa_URL", v)}
                        disabled={
                          !podeEditarProjeto(usuarioLogado, selecionado)
                        }
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label style={labelStyle}>Registro semanal do líder</label>
                    <textarea
                      value={rascunho.Registro_Semanal}
                      onChange={(e) =>
                        atualizarCampo("Registro_Semanal", e.target.value)
                      }
                      disabled={!podeEditarProjeto(usuarioLogado, selecionado)}
                      rows={4}
                      style={{
                        ...textareaStyle,
                        background: podeEditarProjeto(
                          usuarioLogado,
                          selecionado
                        )
                          ? "#fff"
                          : "#f4f6f8",
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label style={labelStyle}>Link do vídeo do editor</label>
                    <input
                      value={rascunho.Video_Editor_Link}
                      onChange={(e) =>
                        atualizarCampo("Video_Editor_Link", e.target.value)
                      }
                      disabled={
                        !podeSubirVideoEditor(usuarioLogado, selecionado)
                      }
                      style={{
                        ...inputStyle,
                        background: podeSubirVideoEditor(
                          usuarioLogado,
                          selecionado
                        )
                          ? "#fff"
                          : "#f4f6f8",
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label style={labelStyle}>Observações</label>
                    <textarea
                      value={rascunho.Observacoes}
                      onChange={(e) =>
                        atualizarCampo("Observacoes", e.target.value)
                      }
                      disabled={
                        !podeEditarProjeto(usuarioLogado, selecionado) &&
                        !podeSubirVideoEditor(usuarioLogado, selecionado)
                      }
                      rows={4}
                      style={{
                        ...textareaStyle,
                        background:
                          podeEditarProjeto(usuarioLogado, selecionado) ||
                          podeSubirVideoEditor(usuarioLogado, selecionado)
                            ? "#fff"
                            : "#f4f6f8",
                      }}
                    />
                  </div>

                  <button
                    onClick={salvarAlteracoes}
                    disabled={
                      !podeEditarProjeto(usuarioLogado, selecionado) &&
                      !podeSubirVideoEditor(usuarioLogado, selecionado)
                    }
                    style={{
                      ...botaoPrimarioStyleGrande,
                      marginTop: 16,
                      opacity:
                        !podeEditarProjeto(usuarioLogado, selecionado) &&
                        !podeSubirVideoEditor(usuarioLogado, selecionado)
                          ? 0.6
                          : 1,
                    }}
                  >
                    Salvar alterações
                  </button>

                  {usuarioLogado.cargo === "diretoria" && (
                    <button
                      onClick={() =>
                        alterarArquivamentoProjeto(!mostrarArquivados)
                      }
                      style={{
                        ...botaoSecundarioGrandeStyle,
                        marginTop: 10,
                        width: "100%",
                        color: mostrarArquivados ? "#087443" : "#c2410c",
                      }}
                    >
                      {mostrarArquivados
                        ? "Reativar projeto"
                        : "Arquivar projeto"}
                    </button>
                  )}
                </>
              )}
            </div>

            <div style={cardStyle}>
              <div style={secaoTituloStyle}>Elenco do projeto</div>

              {!rascunho ? (
                <div style={{ color: estilos.textoSuave }}>
                  Selecione um projeto.
                </div>
              ) : (
                <>
                  {podeEditarProjeto(usuarioLogado, selecionado) && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                          ? "1fr"
                          : "1fr 1fr 1fr auto",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <input
                        placeholder="Personagem"
                        value={novoElencoRascunho.personagem}
                        onChange={(e) =>
                          setNovoElencoRascunho({
                            ...novoElencoRascunho,
                            personagem: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                      <input
                        placeholder="Dublador"
                        value={novoElencoRascunho.dublador}
                        onChange={(e) =>
                          setNovoElencoRascunho({
                            ...novoElencoRascunho,
                            dublador: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                      <input
                        placeholder="Função"
                        value={novoElencoRascunho.funcao}
                        onChange={(e) =>
                          setNovoElencoRascunho({
                            ...novoElencoRascunho,
                            funcao: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                      <button
                        onClick={adicionarElencoRascunho}
                        style={botaoPrimarioStyle}
                      >
                        Adicionar
                      </button>
                    </div>
                  )}

                  {rascunho.Elenco.length === 0 ? (
                    <div style={{ color: estilos.textoSuave }}>
                      Nenhum personagem registrado ainda.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {rascunho.Elenco.map((item) => {
                        const ranking = rankingDubladores.find(
                          (r) =>
                            normalizar(r.nome) === normalizar(item.dublador)
                        );
                        return (
                          <div
                            key={item.id}
                            style={{
                              border: `1px solid ${estilos.borda}`,
                              borderRadius: 16,
                              padding: 14,
                              background: "#fbfdff",
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 14,
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800 }}>
                                {item.personagem}
                              </div>
                              <div style={{ marginTop: 4 }}>
                                <strong>Dublador:</strong> {item.dublador}
                              </div>
                              <div
                                style={{
                                  color: estilos.textoSuave,
                                  marginTop: 4,
                                }}
                              >
                                {item.funcao || "Sem função informada"}
                              </div>
                              <div
                                style={{
                                  marginTop: 8,
                                  display: "inline-block",
                                  background: "#eaf2ff",
                                  color: estilos.azulEscuro,
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  fontWeight: 700,
                                  fontSize: 12,
                                }}
                              >
                                {ranking?.totalProjetos || 0} projeto(s) •{" "}
                                {ranking?.totalPapeis || 0} papel(is)
                              </div>
                            </div>
                            {podeEditarProjeto(usuarioLogado, selecionado) && (
                              <button
                                onClick={() => removerElencoRascunho(item.id)}
                                style={botaoSecundarioStyle}
                              >
                                Remover
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={cardStyle}>
              <div style={secaoTituloStyle}>Top dubladores</div>
              {rankingDubladores.length === 0 ? (
                <div style={{ color: estilos.textoSuave }}>
                  Ainda não há registros suficientes.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {rankingDubladores.slice(0, 8).map((item, idx) => (
                    <div
                      key={item.nome + idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        borderRadius: 14,
                        background: idx === 0 ? "#edf4ff" : "#f8fbff",
                        border: `1px solid ${estilos.borda}`,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {idx + 1}. {item.nome}
                      </div>
                      <div
                        style={{
                          background: estilos.azul,
                          color: "#fff",
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {item.totalProjetos} proj. / {item.totalPapeis} papéis
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {mostrarNovoProjeto && (
        <Modal
          titulo="Novo projeto"
          onClose={() => setMostrarNovoProjeto(false)}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 12,
            }}
          >
            <Campo
              label="Projeto"
              value={novoProjeto.Projeto}
              onChange={(v) => setNovoProjeto({ ...novoProjeto, Projeto: v })}
            />
            <Campo
              label="Tipo"
              value={novoProjeto.Tipo}
              onChange={(v) => setNovoProjeto({ ...novoProjeto, Tipo: v })}
            />
            <Campo
              label="Gênero"
              value={novoProjeto.Genero}
              onChange={(v) => setNovoProjeto({ ...novoProjeto, Genero: v })}
            />
            <Campo
              label="Prioridade"
              value={novoProjeto.Prioridade}
              onChange={(v) =>
                setNovoProjeto({ ...novoProjeto, Prioridade: v })
              }
            />
            <Campo
              label="Dupla"
              value={novoProjeto.Dupla}
              onChange={(v) => setNovoProjeto({ ...novoProjeto, Dupla: v })}
            />
            <Campo
              label="Líder"
              value={novoProjeto.Lider}
              onChange={(v) => setNovoProjeto({ ...novoProjeto, Lider: v })}
              disabled={
                usuarioLogado.cargo === "lider" ||
                usuarioLogado.cargo === "lider_treinamento"
              }
            />
            <Campo
              label="Telefone do líder"
              value={novoProjeto.Telefone_Lider}
              onChange={(v) =>
                setNovoProjeto({ ...novoProjeto, Telefone_Lider: v })
              }
            />
            <Campo
              label="Editor"
              value={novoProjeto.Editor}
              onChange={(v) => setNovoProjeto({ ...novoProjeto, Editor: v })}
            />
            <Campo
              label="Telefone do editor"
              value={novoProjeto.Telefone_Editor}
              onChange={(v) =>
                setNovoProjeto({ ...novoProjeto, Telefone_Editor: v })
              }
            />
            <Campo
              label="Status"
              value={novoProjeto.Status}
              onChange={(v) => setNovoProjeto({ ...novoProjeto, Status: v })}
            />
            <Campo
              label="Data de início"
              value={novoProjeto.Data_Inicio}
              onChange={(v) =>
                setNovoProjeto({ ...novoProjeto, Data_Inicio: v })
              }
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <Campo
                label="Link da capa do projeto"
                value={novoProjeto.Capa_URL}
                onChange={(v) =>
                  setNovoProjeto({ ...novoProjeto, Capa_URL: v })
                }
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Observações</label>
            <textarea
              value={novoProjeto.Observacoes}
              onChange={(e) =>
                setNovoProjeto({ ...novoProjeto, Observacoes: e.target.value })
              }
              rows={3}
              style={textareaStyle}
            />
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={secaoTituloStyle}>Elenco inicial do projeto</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr auto",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <input
                placeholder="Personagem"
                value={novoElencoProjeto.personagem}
                onChange={(e) =>
                  setNovoElencoProjeto({
                    ...novoElencoProjeto,
                    personagem: e.target.value,
                  })
                }
                style={inputStyle}
              />
              <input
                placeholder="Dublador"
                value={novoElencoProjeto.dublador}
                onChange={(e) =>
                  setNovoElencoProjeto({
                    ...novoElencoProjeto,
                    dublador: e.target.value,
                  })
                }
                style={inputStyle}
              />
              <input
                placeholder="Função"
                value={novoElencoProjeto.funcao}
                onChange={(e) =>
                  setNovoElencoProjeto({
                    ...novoElencoProjeto,
                    funcao: e.target.value,
                  })
                }
                style={inputStyle}
              />
              <button
                onClick={adicionarElencoNovoProjeto}
                style={botaoPrimarioStyle}
              >
                Adicionar
              </button>
            </div>

            {novoProjeto.Elenco.length > 0 && (
              <div style={{ display: "grid", gap: 8 }}>
                {novoProjeto.Elenco.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "#f8fbff",
                      border: `1px solid ${estilos.borda}`,
                    }}
                  >
                    <div>
                      <strong>{item.personagem}</strong> — {item.dublador}
                      <div style={{ color: estilos.textoSuave, marginTop: 4 }}>
                        {item.funcao || "Sem função informada"}
                      </div>
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

          <button
            onClick={criarProjeto}
            style={{ ...botaoPrimarioStyleGrande, marginTop: 20 }}
          >
            Criar projeto
          </button>
        </Modal>
      )}

      {mostrarUsuarios && (
        <Modal
          titulo="Gestão de usuários"
          onClose={() => setMostrarUsuarios(false)}
          largo
        >
          <div style={{ ...cardStyle, boxShadow: "none", marginBottom: 16 }}>
            <div style={secaoTituloStyle}>Novo perfil</div>
            <div
              style={{
                background: "#fff8e6",
                border: "1px solid #ffe2a8",
                borderRadius: 14,
                padding: 12,
                marginBottom: 14,
                color: "#7a4b00",
                fontWeight: 700,
              }}
            >
              Atenção: aqui você cria o perfil e permissões. Para a pessoa
              conseguir entrar, ela também precisa existir em Supabase &gt;
              Authentication &gt; Users.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 12,
              }}
            >
              <Campo
                label="Nome"
                value={novoUsuario.nome}
                onChange={(v) => setNovoUsuario({ ...novoUsuario, nome: v })}
              />
              <Campo
                label="E-mail/Login"
                value={novoUsuario.login}
                onChange={(v) => setNovoUsuario({ ...novoUsuario, login: v })}
              />

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

              {novoUsuario.cargo === "lider_treinamento" && (
                <div>
                  <label style={labelStyle}>Status do treinamento</label>
                  <select
                    value={novoUsuario.training_status || "em_andamento"}
                    onChange={(e) =>
                      setNovoUsuario({
                        ...novoUsuario,
                        training_status: e.target.value as TrainingStatus,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="reprovado">Reprovado</option>
                  </select>
                </div>
              )}

              <div style={{ gridColumn: "1 / -1" }}>
                <Campo
                  label="Vínculo de acesso"
                  value={novoUsuario.vinculo}
                  onChange={(v) =>
                    setNovoUsuario({ ...novoUsuario, vinculo: v })
                  }
                />
                <p
                  style={{
                    marginTop: 8,
                    color: estilos.textoSuave,
                    fontSize: 13,
                  }}
                >
                  Para líder, use exatamente o valor do campo{" "}
                  <strong>Lider</strong>. Para editor, use exatamente o valor do
                  campo <strong>Editor</strong>. Para diretoria/adm, use{" "}
                  <strong>todos</strong>.
                </p>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={secaoTituloStyle}>Permissões de acesso</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                    gap: 10,
                  }}
                >
                  {permissoesDisponiveis.map((item) => (
                    <label
                      key={item.chave}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        border: `1px solid ${estilos.borda}`,
                        borderRadius: 12,
                        padding: 10,
                        background: "#f8fbff",
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
              </div>
            </div>

            <button
              onClick={criarUsuario}
              style={{ ...botaoPrimarioStyleGrande, marginTop: 16 }}
            >
              Criar perfil
            </button>
          </div>

          <div style={{ ...cardStyle, boxShadow: "none", padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 1180,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fbff", textAlign: "left" }}>
                    <th style={thStyle}>Nome</th>
                    <th style={thStyle}>Login</th>
                    <th style={thStyle}>Cargo</th>
                    <th style={thStyle}>Vínculo</th>
                    <th style={thStyle}>Treinamento</th>
                    <th style={thStyle}>Permissões</th>
                    <th style={thStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosVisiveis.map((u) => (
                    <tr
                      key={u.id || u.login}
                      style={{ borderTop: `1px solid ${estilos.borda}` }}
                    >
                      <td style={tdStyle}>{u.nome}</td>
                      <td style={tdStyle}>{u.login}</td>
                      <td style={tdStyle}>{cargoLabel(u.cargo)}</td>
                      <td style={tdStyle}>{u.vinculo}</td>
                      <td style={tdStyle}>
                        {podeGerenciarTreinamentos(usuarioLogado) &&
                        u.cargo === "lider_treinamento" ? (
                          <select
                            value={u.training_status || "em_andamento"}
                            onChange={(e) =>
                              atualizarTrainingStatus(
                                u,
                                e.target.value as TrainingStatus
                              )
                            }
                            style={inputStyle}
                          >
                            <option value="pendente">Pendente</option>
                            <option value="em_andamento">Em andamento</option>
                            <option value="concluido">Concluído</option>
                            <option value="reprovado">Reprovado</option>
                          </select>
                        ) : (
                          statusTreinamentoLabel(u.training_status)
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(2, minmax(120px, 1fr))",
                            gap: 6,
                          }}
                        >
                          {permissoesDisponiveis.map((item) => (
                            <label
                              key={`${u.id}-${item.chave}`}
                              style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                                fontSize: 12,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={temAcesso(u, item.chave)}
                                disabled={
                                  u.cargo === "diretoria" &&
                                  usuarioLogado.cargo !== "diretoria"
                                }
                                onChange={(e) =>
                                  atualizarPermissaoUsuario(
                                    u,
                                    item.chave,
                                    e.target.checked
                                  )
                                }
                              />
                              {item.label}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          {podeGerenciarTreinamentos(usuarioLogado) &&
                            u.cargo === "lider_treinamento" && (
                              <button
                                onClick={() => concluirTreinamento(u)}
                                style={botaoPrimarioStyle}
                              >
                                Concluir
                              </button>
                            )}
                          <button
                            onClick={() => excluirUsuario(u)}
                            style={botaoSecundarioStyle}
                            disabled={!podeExcluirUsuario(usuarioLogado, u)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {mostrarMembros && (
        <Modal
          titulo="Membros da comunidade"
          onClose={() => setMostrarMembros(false)}
          largo
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <ResumoCard
              titulo="Total de membros"
              valor={String(membros.length)}
            />
            <ResumoCard
              titulo="Na comunidade"
              valor={String(totalMembrosAtivos)}
            />
            <ResumoCard titulo="Saíram" valor={String(totalMembrosSaida)} />
            <ResumoCard
              titulo="Crescimento acumulado"
              valor={String(
                relatorioEntradaSaida[relatorioEntradaSaida.length - 1]
                  ?.totalFinal || 0
              )}
            />
          </div>

          <div style={{ ...cardStyle, boxShadow: "none", marginBottom: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr auto auto auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                placeholder="Buscar por nome, telefone, e-mail, status ou observação..."
                value={queryMembros}
                onChange={(e) => setQueryMembros(e.target.value)}
                style={inputStyle}
              />
              <button
                onClick={recarregarMembros}
                style={botaoSecundarioGrandeStyle}
              >
                Atualizar
              </button>
              <button
                onClick={exportarMembrosCSV}
                style={botaoSecundarioGrandeStyle}
              >
                Exportar membros
              </button>
              <button
                onClick={exportarRelatorioEntradaSaidaCSV}
                style={botaoSecundarioGrandeStyle}
              >
                Exportar entrada/saída
              </button>
            </div>
          </div>

          <div style={{ ...cardStyle, boxShadow: "none", marginBottom: 16 }}>
            <div style={secaoTituloStyle}>Relatório de entrada e saída</div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 760,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fbff", textAlign: "left" }}>
                    <th style={thStyle}>Mês</th>
                    <th style={thStyle}>Total inicial</th>
                    <th style={thStyle}>Entradas</th>
                    <th style={thStyle}>Saídas</th>
                    <th style={thStyle}>Crescimento</th>
                    <th style={thStyle}>Total final</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorioEntradaSaida.map((r) => (
                    <tr
                      key={r.mes}
                      style={{ borderTop: `1px solid ${estilos.borda}` }}
                    >
                      <td style={tdStyle}>{r.mesLabel}</td>
                      <td style={tdStyle}>{r.totalInicial}</td>
                      <td style={tdStyle}>{r.entradas}</td>
                      <td style={tdStyle}>{r.saidas}</td>
                      <td
                        style={{
                          ...tdStyle,
                          color: r.crescimento < 0 ? "#c2410c" : "#087443",
                          fontWeight: 800,
                        }}
                      >
                        {r.crescimento}
                      </td>
                      <td style={tdStyle}>{r.totalFinal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...cardStyle, boxShadow: "none", padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 1120,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fbff", textAlign: "left" }}>
                    <th style={thStyle}>Nome</th>
                    <th style={thStyle}>Telefone</th>
                    <th style={thStyle}>E-mail</th>
                    <th style={thStyle}>Idade</th>
                    <th style={thStyle}>Entrada</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Saída</th>
                    <th style={thStyle}>Observação</th>
                    <th style={thStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {membrosFiltrados.map((m) => {
                    const cor = corStatusMembro(m.status);
                    return (
                      <tr
                        key={m.id || m.email || m.nome}
                        style={{ borderTop: `1px solid ${estilos.borda}` }}
                      >
                        <td style={tdStyle}>
                          <strong>{m.nome}</strong>
                          <div
                            style={{ color: estilos.textoSuave, marginTop: 4 }}
                          >
                            {m.habilidades || "Sem habilidades informadas"}
                          </div>
                        </td>
                        <td style={tdStyle}>{m.telefone || "-"}</td>
                        <td style={tdStyle}>{m.email || "-"}</td>
                        <td style={tdStyle}>{m.idade || "-"}</td>
                        <td style={tdStyle}>
                          {formatarDataBR(m.data_entrada) || "-"}
                        </td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "7px 12px",
                              borderRadius: 999,
                              background: cor.bg,
                              color: cor.color,
                              fontWeight: 800,
                              fontSize: 13,
                            }}
                          >
                            {statusMembroLabel(m.status)}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {formatarDataBR(m.data_saida) || "-"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            minWidth: 220,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {m.observacao || "-"}
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() =>
                                alterarStatusMembro(m, "na_comunidade")
                              }
                              style={botaoSecundarioStyle}
                            >
                              Na comunidade
                            </button>
                            <button
                              onClick={() => alterarStatusMembro(m, "saiu")}
                              style={botaoSecundarioStyle}
                            >
                              Saiu
                            </button>
                            <button
                              onClick={() => alterarStatusMembro(m, "banido")}
                              style={botaoSecundarioStyle}
                            >
                              Banido
                            </button>
                            <button
                              onClick={() => alterarStatusMembro(m, "pausado")}
                              style={botaoSecundarioStyle}
                            >
                              Pausado
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {mostrarRelatorios && (
        <Modal
          titulo="Painel de relatórios"
          onClose={() => setMostrarRelatorios(false)}
          largo
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(2, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            {temAcesso(usuarioLogado, "acesso_relatorios_projetos") && (
              <RelatorioCard
                titulo="Relatório de projetos"
                texto="Exporta a lista filtrada de projetos, status, líder, editor e observações."
                botao="Exportar projetos"
                onClick={exportarProjetosCSV}
              />
            )}
            {temAcesso(usuarioLogado, "acesso_relatorios_elenco") && (
              <RelatorioCard
                titulo="Relatório de elenco"
                texto="Exporta personagens, dubladores, funções e ranking de participação."
                botao="Exportar elenco"
                onClick={exportarElencoCSV}
              />
            )}
            {temAcesso(usuarioLogado, "acesso_relatorios_membros") && (
              <RelatorioCard
                titulo="Relatório de membros"
                texto="Exporta nomes, telefones, status, datas e observações da comunidade."
                botao="Exportar membros"
                onClick={exportarMembrosCSV}
              />
            )}
            {temAcesso(usuarioLogado, "acesso_relatorios_entrada_saida") && (
              <RelatorioCard
                titulo="Entrada e saída"
                texto="Exporta o comparativo mensal com total inicial, entradas, saídas e crescimento."
                botao="Exportar entrada/saída"
                onClick={exportarRelatorioEntradaSaidaCSV}
              />
            )}
          </div>
        </Modal>
      )}

      {mostrarCentralAjuda && (
        <Modal
          titulo="Central de Ajuda"
          onClose={() => setMostrarCentralAjuda(false)}
          largo
        >
          <div
            style={{
              background: "linear-gradient(135deg, #eaf2ff, #f8fbff)",
              border: `1px solid ${estilos.borda}`,
              borderRadius: 22,
              padding: isMobile ? 18 : 28,
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: estilos.azul,
                fontWeight: 900,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                fontSize: 13,
              }}
            >
              Central de ajuda DubWorks
            </div>
            <h2
              style={{
                margin: "10px 0 0",
                color: estilos.texto,
                fontSize: isMobile ? 26 : 38,
              }}
            >
              Como podemos te ajudar hoje?
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            <AjudaCard
              titulo="Projetos"
              texto="Crie, edite, arquive e acompanhe projetos por líder/editor."
            />
            <AjudaCard
              titulo="Membros"
              texto="Consulte membros, telefones, status e relatório de entrada/saída."
            />
            <AjudaCard
              titulo="Usuários"
              texto="Cadastre perfis, cargos e vínculos de acesso."
            />
            <AjudaCard
              titulo="Relatórios"
              texto="Exporte projetos, elenco, membros e crescimento mensal."
            />
            <AjudaCard
              titulo="Permissões"
              texto="Diretoria e ADM veem tudo. Líderes e editores veem apenas vínculos."
            />
            <AjudaCard
              titulo="Treinamentos"
              texto="Acompanhe líderes em treinamento e conclua alterações de cargo."
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

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
        background: ativo ? "#eef5ff" : "#fff",
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
        background: "#fff",
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
        background: "#fff",
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
        style={{ ...inputStyle, background: disabled ? "#f4f6f8" : "#fff" }}
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
          background: "#fff",
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
        background: "linear-gradient(180deg, #ffffff, #f8fbff)",
      }}
    >
      <div
        style={{ color: estilos.textoSuave, fontSize: 15, marginBottom: 12 }}
      >
        {titulo}
      </div>
      <div style={{ fontSize: 40, fontWeight: 800, color: estilos.azulEscuro }}>
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
        background: "#f6faff",
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

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${estilos.borda}`,
  borderRadius: 22,
  padding: 18,
  boxShadow: "0 10px 28px rgba(17, 74, 156, 0.06)",
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
  color: estilos.texto,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 13,
  borderRadius: 14,
  border: `1px solid ${estilos.borda}`,
  fontSize: 15,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 13,
  borderRadius: 14,
  border: `1px solid ${estilos.borda}`,
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
  background: "#fff",
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
  background: "linear-gradient(135deg, #0d47a1, #1366d9)",
  color: "#fff",
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
  background: "#fff",
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
  background: "#eef5ff",
};

const megaItemStyle: React.CSSProperties = {
  textAlign: "left",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: "14px 4px",
};

const botaoPrimarioStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #0d47a1, #1366d9)",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "11px 16px",
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 8px 20px rgba(19, 102, 217, 0.22)",
};

const botaoPrimarioStyleGrande: React.CSSProperties = {
  width: "100%",
  background: "linear-gradient(135deg, #0d47a1, #1366d9)",
  color: "#fff",
  border: "none",
  borderRadius: 16,
  padding: 16,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(19, 102, 217, 0.22)",
};

const botaoSecundarioStyle: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${estilos.borda}`,
  borderRadius: 14,
  padding: "11px 15px",
  cursor: "pointer",
  fontWeight: 700,
  color: estilos.azulEscuro,
};

const botaoSecundarioGrandeStyle: React.CSSProperties = {
  background: "#f8fbff",
  border: `1px solid ${estilos.borda}`,
  borderRadius: 14,
  padding: 14,
  cursor: "pointer",
  fontWeight: 700,
  color: estilos.azulEscuro,
};
