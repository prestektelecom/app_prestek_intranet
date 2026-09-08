import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

// Um único fetch de /api/comunicados a cada 30s para todo o chrome.
// Antes, Sidebar, NotificationBell e MobileMoreSheet faziam três pollings
// paralelos do mesmo endpoint e chegavam a contagens diferentes.
//
// Contrato do endpoint: 200 { sucesso: true, comunicados: [...] } (lista pode
// vir vazia). Qualquer outra coisa é erro; lista vazia não é erro.
//
// Assinatura via useSyncExternalStore: quem monta lê o snapshot atual e nunca
// perde um `notify` que aconteça entre o render e o effect.

const POLL_MS = 30000;
const TIPOS_NOTIFICADOS = ['Urgente', 'Importante'];

const store = {
  comunicados: [],
  loaded: false,
  erro: null,
  version: 0,
  listeners: new Set(),
  timer: null,
  inflight: null,
};

function notify() {
  store.version += 1;
  store.listeners.forEach((fn) => fn());
}

async function carregar() {
  if (store.inflight) return store.inflight;
  store.inflight = (async () => {
    try {
      const res = await fetch('/api/comunicados');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.sucesso || !Array.isArray(data.comunicados)) throw new Error('resposta inesperada');
      store.comunicados = data.comunicados;
      store.erro = null;
    } catch (err) {
      store.erro = err;
      console.error('Erro ao buscar comunicados', err);
    } finally {
      store.loaded = true;
      store.inflight = null;
      notify();
    }
  })();
  return store.inflight;
}

function subscribe(fn) {
  store.listeners.add(fn);
  if (store.listeners.size === 1) {
    carregar();
    store.timer = setInterval(carregar, POLL_MS);
  }
  return () => {
    store.listeners.delete(fn);
    if (store.listeners.size === 0 && store.timer) {
      clearInterval(store.timer);
      store.timer = null;
    }
  };
}

const getVersion = () => store.version;

export function useComunicados() {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return {
    comunicados: store.comunicados,
    loaded: store.loaded,
    erro: store.erro,
    recarregar: carregar,
  };
}

// ── Estado "lido" das notificações ─────────────────────────────────────────
// Persistido por usuário em localStorage (`notif_seen_<id>`); o evento
// `stitch:notif-seen` sincroniza os componentes que mostram contagem.

const SEEN_EVENT = 'stitch:notif-seen';

function seenKey(userId) {
  return `notif_seen_${userId || 'anonymous'}`;
}

function readSeen(userId) {
  try {
    const raw = localStorage.getItem(seenKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (_) {
    return [];
  }
}

function writeSeen(userId, ids, currentIds) {
  // Só guarda IDs que ainda existem, para o localStorage não crescer sem fim.
  const atuais = new Set(currentIds.map(String));
  const limpos = Array.from(new Set(ids.map(String))).filter((id) => atuais.has(id));
  try {
    localStorage.setItem(seenKey(userId), JSON.stringify(limpos));
  } catch (_) {
    /* storage cheio ou bloqueado: segue só em memória */
  }
  window.dispatchEvent(new CustomEvent(SEEN_EVENT, { detail: { userId } }));
  return limpos;
}

export function userIdOf(user) {
  return user?.funcionario?.id ?? user?.id ?? null;
}

const byDateDesc = (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();

/**
 * Comunicados que viram notificação (Urgente e Importante), já separados em
 * lidos e não lidos para o usuário. Usado pelo sino e pelos badges de
 * "Comunicados" na Sidebar e na barra inferior, que assim contam a mesma coisa.
 */
export function useNotificacoes(user) {
  const userId = userIdOf(user);
  const { comunicados, loaded, erro } = useComunicados();
  const [seenIds, setSeenIds] = useState(() => readSeen(userId));

  useEffect(() => {
    setSeenIds(readSeen(userId));
    const onSeen = (e) => {
      if (!e.detail || e.detail.userId === userId) setSeenIds(readSeen(userId));
    };
    window.addEventListener(SEEN_EVENT, onSeen);
    return () => window.removeEventListener(SEEN_EVENT, onSeen);
  }, [userId]);

  const notificaveis = useMemo(
    () => comunicados.filter((c) => TIPOS_NOTIFICADOS.includes(c.tipo)),
    [comunicados]
  );
  const currentIds = useMemo(() => notificaveis.map((c) => String(c.id)), [notificaveis]);

  const urgentes = useMemo(
    () => notificaveis.filter((c) => c.tipo === 'Urgente').slice().sort(byDateDesc),
    [notificaveis]
  );
  const importantes = useMemo(
    () => notificaveis.filter((c) => c.tipo === 'Importante').slice().sort(byDateDesc),
    [notificaveis]
  );

  const isUnread = useCallback((c) => !seenIds.includes(String(c.id)), [seenIds]);
  const naoLidosUrgentes = useMemo(() => urgentes.filter(isUnread).length, [urgentes, isUnread]);
  const naoLidosImportantes = useMemo(() => importantes.filter(isUnread).length, [importantes, isUnread]);

  const marcarLida = useCallback(
    (id) => {
      const atual = readSeen(userId);
      if (atual.includes(String(id))) return;
      writeSeen(userId, [...atual, String(id)], currentIds);
    },
    [userId, currentIds]
  );

  const marcarTodas = useCallback(() => {
    if (currentIds.length === 0) return;
    writeSeen(userId, [...readSeen(userId), ...currentIds], currentIds);
  }, [userId, currentIds]);

  return {
    urgentes,
    importantes,
    isUnread,
    naoLidos: naoLidosUrgentes + naoLidosImportantes,
    naoLidosUrgentes,
    naoLidosImportantes,
    marcarLida,
    marcarTodas,
    loaded,
    erro,
  };
}
