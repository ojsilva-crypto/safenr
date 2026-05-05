
/* ══════════════════════════════════════════════════
   SafeNR — Service Worker (PWA)
   Fase 2 — Cache offline + notificações push
   ══════════════════════════════════════════════════ */

var CACHE_NAME    = 'safenr-v2';
var CACHE_STATIC  = 'safenr-static-v2';

/* Arquivos que ficam em cache para funcionar offline */
var ARQUIVOS_CACHE = [
  './app.html',
  './index.html',
  './treinamentos.html',
  './agenda.html',
  './inspecoes.html',
  './riscos.html',
  './checklists.html',
  './colaboradores.html',
  './ocorrencias.html',
  './plano-acao.html',
  './documentos.html',
  './relatorios.html',
  './epis.html',
  './biblioteca.html',
  './fotos.html',
  './ambientes.html',
  './ia-sugestoes.html',
  './notificacoes.html',
  './configuracoes.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

/* ── INSTALL: faz cache dos arquivos estáticos ── */
self.addEventListener('install', function(e) {
  console.log('[SafeNR SW] Instalando...');
  e.waitUntil(
    caches.open(CACHE_STATIC).then(function(cache) {
      return cache.addAll(ARQUIVOS_CACHE).catch(function(err) {
        console.warn('[SafeNR SW] Alguns arquivos nao cacheados:', err);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ── ACTIVATE: limpa caches antigos ── */
self.addEventListener('activate', function(e) {
  console.log('[SafeNR SW] Ativando...');
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_STATIC && k !== CACHE_NAME; })
            .map(function(k)    { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ── FETCH: Estratégia Cache First para estáticos, Network First para API ── */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  /* Supabase API — sempre busca na rede */
  if (url.includes('supabase.co') || url.includes('supabase.io')) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  /* Arquivos estáticos — cache first */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        var responseClone = response.clone();
        caches.open(CACHE_STATIC).then(function(cache) {
          cache.put(e.request, responseClone);
        });
        return response;
      }).catch(function() {
        /* Fallback offline para páginas HTML */
        if (e.request.destination === 'document') {
          return caches.match('./app.html');
        }
      });
    })
  );
});

/* ══════════════════════════════════════════════════
   NOTIFICAÇÕES PUSH
   ══════════════════════════════════════════════════ */

/* Recebe push do servidor */
self.addEventListener('push', function(e) {
  var dados = {};
  try { dados = e.data ? e.data.json() : {}; } catch(err) { dados = {}; }

  var titulo = dados.titulo || 'SafeNR — Alerta';
  var opcoes = {
    body:    dados.mensagem || 'Voce tem um novo alerta de seguranca.',
    icon:    './icons/icon-192.png',
    badge:   './icons/icon-72.png',
    tag:     dados.tag || 'safenr-alerta',
    renotify: true,
    vibrate: [200, 100, 200],
    data:    { url: dados.url || './app.html' },
    actions: [
      { action: 'ver',     title: 'Ver Agora' },
      { action: 'ignorar', title: 'Ignorar'   }
    ]
  };

  e.waitUntil(self.registration.showNotification(titulo, opcoes));
});

/* Clique na notificação */
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  if (e.action === 'ignorar') return;

  var urlDestino = (e.notification.data && e.notification.data.url) || './app.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(lista) {
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].url.includes('safenr') && 'focus' in lista[i]) {
          lista[i].navigate(urlDestino);
          return lista[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(urlDestino);
    })
  );
});

/* ── Sincronização em background (quando voltar online) ── */
self.addEventListener('sync', function(e) {
  if (e.tag === 'safenr-sync') {
    console.log('[SafeNR SW] Sincronizando dados pendentes...');
    e.waitUntil(sincronizarPendentes());
  }
});

async function sincronizarPendentes() {
  /* Notifica todos os clientes para re-sincronizar */
  var lista = await clients.matchAll({ type: 'window' });
  lista.forEach(function(client) {
    client.postMessage({ tipo: 'SYNC_SOLICITADA' });
  });
}
