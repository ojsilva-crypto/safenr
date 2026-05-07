(function () {
  /* ══════════════════════════════════════
     SafeNR — Sidebar Dinamica Centralizada
     Inclua este script em TODAS as páginas
  ══════════════════════════════════════ */

  var MENU = [
    { href: './app.html',          icon: '🏠',  label: 'Dashboard' },
    { href: './treinamentos.html', icon: '🎓',  label: 'Treinamentos' },
    { href: './agenda.html',       icon: '📅',  label: 'Agenda' },
    { href: './inspecoes.html',    icon: '🔍',  label: 'Inspecoes' },
    { href: './riscos.html',       icon: '⚠️',  label: 'Riscos' },
    { href: './checklists.html',   icon: '📋',  label: 'Checklists' },
    { href: './colaboradores.html',icon: '👷',  label: 'Colaboradores' },
    { href: './ocorrencias.html',  icon: '🚨',  label: 'Ocorrencias' },
    { href: './plano-acao.html',   icon: '📌',  label: 'Plano de Acao' },
    { href: './documentos.html',   icon: '🗂️', label: 'Documentos SST' },
    { href: './relatorios.html',   icon: '📄',  label: 'Relatorios' },
    { href: './epis.html',         icon: '🦺',  label: 'Cadastro EPIs' },
    { href: './biblioteca.html',   icon: '📚',  label: 'Biblioteca NRs' },
    { href: './fotos.html',        icon: '📷',  label: 'Galeria de Fotos' },
    { href: './ambientes.html',    icon: '🏭',  label: 'Ambientes' },
    { href: './ia-sugestoes.html', icon: '🤖',  label: 'IA Sugestoes' },
    { href: './esocial.html',      icon: '🏛️', label: 'eSocial SST' },
    { href: './notificacoes.html', icon: '🔔',  label: 'Notificacoes' },
    { href: './configuracoes.html',icon: '⚙️',  label: 'Configuracoes' }
  ];

  /* ── Detecta página atual ── */
  var paginaAtual = window.location.pathname.split('/').pop() || 'app.html';

  /* ── Lê dados do usuário ── */
  var userData = localStorage.getItem('safenr_user');
  if (!userData && paginaAtual !== 'index.html') {
    window.location.href = './index.html';
    return;
  }
  var user = userData ? JSON.parse(userData) : {};

  /* ── Conta notificações não lidas ── */
  function contarNaoLidas() {
    var n = JSON.parse(localStorage.getItem('safenr_notificacoes') || '[]');
    return n.filter(function (x) { return !x.lida; }).length;
  }

  /* ── Gera HTML da sidebar ── */
  function gerarSidebar() {
    var naoLidas = contarNaoLidas();
    var nomeUser = user.nome || 'Usuario';
    var letraUser = nomeUser[0].toUpperCase();

    var navItems = MENU.map(function (item) {
      var ativo = paginaAtual === item.href.replace('./', '') ? ' active' : '';
      var badge = '';
      if (item.href === './notificacoes.html' && naoLidas > 0) {
        badge = '<span class="notif-badge">' + naoLidas + '</span>';
      }
      return '<a class="nav-item' + ativo + '" href="' + item.href + '">' +
        '<span class="icon">' + item.icon + '</span> ' + item.label + badge +
        '</a>';
    }).join('');

    return '<div class="sidebar" id="sidebarEl">' +
      '<div class="sidebar-logo">' +
        '<h1>Safe<span>NR</span></h1>' +
        '<p>Gestao de Seguranca do Trabalho</p>' +
      '</div>' +
      '<nav class="nav">' + navItems + '</nav>' +
      '<div class="sidebar-user">' +
        '<div class="avatar" id="avatarLetra">' + letraUser + '</div>' +
        '<div class="user-info">' +
          '<p id="nomeUsuario">' + nomeUser + '</p>' +
          '<span>' + (user.perfil || 'Administrador') + '</span>' +
        '</div>' +
        '<button class="btn-sair" onclick="sairSidebar()">✕</button>' +
      '</div>' +
    '</div>';
  }

  /* ── CSS da sidebar (injeta uma vez) ── */
  function injetarCSS() {
    if (document.getElementById('sidebar-css')) return;
    var style = document.createElement('style');
    style.id = 'sidebar-css';
    style.textContent = [
      '.sidebar{width:240px;background:#0a1520;border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;padding:24px 0;position:fixed;height:100vh;z-index:100;transition:transform .3s}',
      '.sidebar-logo{text-align:center;padding:0 24px 28px;border-bottom:1px solid rgba(255,255,255,.07)}',
      '.sidebar-logo h1{font-size:1.6rem;font-weight:800;letter-spacing:2px}',
      '.sidebar-logo h1 span{color:#00d4ff}',
      '.sidebar-logo p{font-size:.7rem;color:rgba(255,255,255,.35);margin-top:2px}',
      '.nav{flex:1;padding:20px 0;overflow-y:auto}',
      '.nav::-webkit-scrollbar{width:3px}',
      '.nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}',
      '.nav-item{display:flex;align-items:center;gap:12px;padding:13px 24px;cursor:pointer;color:rgba(255,255,255,.5);font-size:.9rem;font-weight:500;transition:all .2s;border-left:3px solid transparent;text-decoration:none}',
      '.nav-item:hover{color:#fff;background:rgba(255,255,255,.04)}',
      '.nav-item.active{color:#00d4ff;border-left-color:#00d4ff;background:rgba(0,212,255,.06)}',
      '.nav-item .icon{font-size:1.1rem;width:20px;text-align:center;flex-shrink:0}',
      '.notif-badge{background:#f87171;color:#fff;border-radius:20px;padding:1px 7px;font-size:.65rem;font-weight:700;margin-left:auto}',
      '.sidebar-user{padding:16px 24px;border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:12px;flex-shrink:0}',
      '.avatar{width:36px;height:36px;background:linear-gradient(135deg,#00d4ff,#0099cc);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;flex-shrink:0}',
      '.user-info p{font-size:.82rem;font-weight:600;color:#fff}',
      '.user-info span{font-size:.72rem;color:rgba(255,255,255,.4)}',
      '.btn-sair{background:none;border:none;color:rgba(255,80,80,.7);cursor:pointer;font-size:.8rem;margin-left:auto;padding:4px}',
      /* Toggle mobile */
      '.sidebar-toggle{display:none;position:fixed;top:16px;left:16px;z-index:200;background:#0a1520;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 10px;cursor:pointer;font-size:1.1rem;color:#fff}',
      '.sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99}',
      '@media(max-width:768px){',
        '.sidebar{transform:translateX(-100%)}',
        '.sidebar.open{transform:translateX(0)}',
        '.sidebar-toggle{display:flex;align-items:center;justify-content:center}',
        '.sidebar-overlay.open{display:block}',
        'body .main, body > .main{margin-left:0!important;padding-top:60px!important}',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  /* ── Injeta sidebar no DOM ── */
  function injetarSidebar() {
    injetarCSS();

    /* Remove sidebar HTML estático se existir */
    var existente = document.querySelector('.sidebar');
    if (existente) existente.remove();

    /* Botão toggle mobile */
    var toggle = document.createElement('button');
    toggle.className = 'sidebar-toggle';
    toggle.innerHTML = '☰';
    toggle.setAttribute('aria-label', 'Abrir menu');
    toggle.onclick = function () {
      document.getElementById('sidebarEl').classList.toggle('open');
      overlay.classList.toggle('open');
    };

    /* Overlay mobile */
    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.onclick = function () {
      document.getElementById('sidebarEl').classList.remove('open');
      overlay.classList.remove('open');
    };

    /* Insere elementos */
    document.body.insertAdjacentHTML('afterbegin', gerarSidebar());
    document.body.appendChild(toggle);
    document.body.appendChild(overlay);

    /* Ajusta margin do main */
    var main = document.querySelector('.main');
    if (main) {
      main.style.marginLeft = '240px';
    }
  }

  /* ── Função global de logout ── */
  window.sairSidebar = function () {
    if (confirm('Deseja sair do SafeNR?')) {
      localStorage.removeItem('safenr_user');
      window.location.href = './index.html';
    }
  };

  /* Alias para compatibilidade com páginas que chamam sair() */
  window.sair = window.sairSidebar;

  /* ── Atualiza badge de notificações a cada 60s ── */
  function atualizarBadge() {
    var n = contarNaoLidas();
    var link = document.querySelector('a[href="./notificacoes.html"]');
    if (!link) return;
    var badge = link.querySelector('.notif-badge');
    if (n > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'notif-badge';
        link.appendChild(badge);
      }
      badge.textContent = n;
    } else if (badge) {
      badge.remove();
    }
  }
  setInterval(atualizarBadge, 60000);

  /* ── Executa quando DOM estiver pronto ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injetarSidebar);
  } else {
    injetarSidebar();
  }

})();
