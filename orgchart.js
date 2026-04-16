/* ===== IBF ORGANOGRAMA — orgchart.js ===== */

(function () {
  'use strict';

  var activeCard = null;
  var AREA_ORDER = ['Marketing', 'Vendas', 'Operações'];

  /* ---- Helpers de status ---- */
  function statusLabel(status) {
    if (status === 'confirmed')  return 'Confirmado';
    if (status === 'evaluation') return 'Em avaliação';
    if (status === 'ext')        return 'Consultora ext.';
    return 'A contratar';
  }

  function statusClass(status) {
    if (status === 'confirmed')  return 'oc-node--confirmed';
    if (status === 'evaluation') return 'oc-node--evaluation';
    if (status === 'ext')        return 'oc-node--ext';
    return 'oc-node--open';
  }

  /* ---- Card de detalhes ---- */
  function renderCard(node) {
    var items = node.responsibilities.map(function (r) {
      return '<li>' + r + '</li>';
    }).join('');

    return '<div class="oc-card" role="tooltip" aria-label="Detalhes ' + node.name + '">' +
      '<div class="oc-card-header">' +
        '<p class="oc-card-name">' + node.name + '</p>' +
        '<span class="oc-badge oc-badge--' + node.status + '">' + statusLabel(node.status) + '</span>' +
      '</div>' +
      '<p class="oc-card-role">' + node.role + '</p>' +
      '<p class="oc-card-reports">Reporta a: ' + node.reportsTo + '</p>' +
      '<ul class="oc-card-list">' + items + '</ul>' +
    '</div>';
  }

  /* ---- Nó individual ---- */
  function renderNode(node) {
    var cls = 'oc-node ' + statusClass(node.status);
    var isOpen = node.status === 'open';

    var inner;
    if (isOpen) {
      inner = '<p class="oc-node-name oc-node-name--open">' + node.role + '</p>' +
              '<span class="oc-badge oc-badge--open">A contratar</span>';
    } else {
      inner = '<p class="oc-node-name">' + node.name + '</p>' +
              '<p class="oc-node-role">' + node.role + '</p>';
      if (node.status === 'ext') {
        inner += '<span class="oc-badge oc-badge--ext">Consultora ext.</span>';
      } else if (node.status === 'evaluation') {
        inner += '<span class="oc-badge oc-badge--evaluation">Em avaliação</span>';
      }
    }

    return '<div class="' + cls + '" data-id="' + node.id + '" ' +
      'tabindex="0" role="button" aria-expanded="false" ' +
      'aria-label="' + (isOpen ? node.role + ', vaga aberta' : node.name + ', ' + node.role) + '">' +
      inner +
      renderCard(node) +
    '</div>';
  }

  /* ---- Coluna de área ---- */
  function renderColumn(area, nodes) {
    var html = '<div class="oc-h-col">';
    html += '<div class="oc-vline"></div>';
    html += '<div class="oc-col-label">' + area + '</div>';

    nodes.forEach(function (node) {
      html += '<div class="oc-col-node-wrap">';
      html += renderNode(node);
      if (node.children && node.children.length > 0) {
        node.children.forEach(function (child) {
          html += '<div class="oc-vline oc-vline--sm"></div>';
          html += renderNode(child);
        });
      }
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  /* ---- Árvore horizontal (desktop) ---- */
  function renderHorizontalTree(data) {
    var root = data.root;

    // Agrupa filhos por área
    var areaMap = {};
    AREA_ORDER.forEach(function (a) { areaMap[a] = []; });
    root.children.forEach(function (child) {
      var area = child.area || 'Outros';
      if (!areaMap[area]) areaMap[area] = [];
      areaMap[area].push(child);
    });

    var html = '<div class="oc-h-tree">';

    // Nó diretor
    html += '<div class="oc-director">' +
      '<p class="oc-director-eyebrow">' + root.role + '</p>' +
      '<p class="oc-director-name">' + root.name + '</p>' +
      '<p class="oc-director-sub">Marketing · Vendas · Captação · Produto</p>' +
    '</div>';

    html += '<div class="oc-vline oc-vline--dark"></div>';

    // Colunas
    html += '<div class="oc-h-columns">';
    AREA_ORDER.forEach(function (area) {
      var nodes = areaMap[area];
      if (nodes && nodes.length > 0) {
        html += renderColumn(area, nodes);
      }
    });
    html += '</div>';

    // Legenda
    html += '<div class="oc-legend">' +
      '<span class="oc-legend-lbl">Legenda</span>' +
      '<div class="oc-leg-item"><div class="oc-ls oc-ls--navy"></div>Confirmado</div>' +
      '<div class="oc-leg-item"><div class="oc-ls oc-ls--orange"></div>Consultora externa</div>' +
      '<div class="oc-leg-item"><div class="oc-ls oc-ls--dash"></div>Em avaliação · A contratar</div>' +
    '</div>';

    html += '</div>'; // /oc-h-tree
    return html;
  }

  /* ---- Lista mobile (accordion) ---- */
  function renderList(node, depth) {
    depth = depth || 0;
    var indent = depth * 16;
    var isOpen = node.status === 'open';
    var badgeClass = 'oc-badge oc-badge--' + node.status;

    var items = node.responsibilities.map(function (r) {
      return '<li>' + r + '</li>';
    }).join('');

    var nameDisplay = isOpen ? node.role : node.name;
    var roleDisplay = isOpen ? '' : '<span class="oc-list-role">' + node.role + '</span>';

    var html = '<div class="oc-list-item" style="margin-left:' + indent + 'px">' +
      '<button class="oc-list-toggle" aria-expanded="false">' +
        '<span class="oc-list-left">' +
          '<span class="oc-list-name">' + nameDisplay + '</span>' +
          roleDisplay +
        '</span>' +
        '<span class="' + badgeClass + '">' + statusLabel(node.status) + '</span>' +
        '<span class="oc-list-chevron" aria-hidden="true">+</span>' +
      '</button>' +
      '<div class="oc-list-body" hidden>' +
        '<p class="oc-list-reports">Reporta a: ' + node.reportsTo + '</p>' +
        '<ul class="oc-list-resp">' + items + '</ul>' +
      '</div>' +
    '</div>';

    if (node.children && node.children.length > 0) {
      node.children.forEach(function (child) {
        html += renderList(child, depth + 1);
      });
    }
    return html;
  }

  /* ---- Fecha todos os cards ---- */
  function closeAll() {
    document.querySelectorAll('.oc-node[aria-expanded="true"]').forEach(function (el) {
      el.setAttribute('aria-expanded', 'false');
    });
    activeCard = null;
  }

  /* ---- Eventos desktop ---- */
  function bindDesktopEvents(container) {
    container.addEventListener('mouseenter', function (e) {
      var node = e.target.closest('.oc-node');
      if (!node) return;
      var id = node.dataset.id;
      if (activeCard && activeCard !== id) return;
      node.setAttribute('aria-expanded', 'true');
    }, true);

    container.addEventListener('mouseleave', function (e) {
      var node = e.target.closest('.oc-node');
      if (!node) return;
      var id = node.dataset.id;
      if (activeCard === id) return;
      node.setAttribute('aria-expanded', 'false');
    }, true);

    container.addEventListener('click', function (e) {
      var node = e.target.closest('.oc-node');
      if (!node) return;
      e.stopPropagation();
      var id = node.dataset.id;
      if (activeCard === id) {
        node.setAttribute('aria-expanded', 'false');
        activeCard = null;
      } else {
        closeAll();
        node.setAttribute('aria-expanded', 'true');
        activeCard = id;
      }
    });

    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var node = e.target.closest('.oc-node');
      if (!node) return;
      e.preventDefault();
      node.click();
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.oc-node')) closeAll();
    });
  }

  /* ---- Eventos mobile ---- */
  function bindMobileEvents(container) {
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.oc-list-toggle');
      if (!btn) return;
      var item = btn.closest('.oc-list-item');
      var body = item.querySelector('.oc-list-body');
      var chevron = btn.querySelector('.oc-list-chevron');
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      body.hidden = isOpen;
      chevron.textContent = isOpen ? '+' : '−';
    });
  }

  /* ---- Init ---- */
  function init(data) {
    var section = document.getElementById('orgchart-section');
    if (!section) return;

    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
      var listHTML = '<div class="oc-list">' + renderList(data.root, 0) + '</div>';
      section.querySelector('.oc-body').innerHTML = listHTML;
      bindMobileEvents(section.querySelector('.oc-body'));
    } else {
      section.querySelector('.oc-body').innerHTML = renderHorizontalTree(data);
      bindDesktopEvents(section.querySelector('.oc-body'));
    }
  }

  fetch('./orgchart-data.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { init(data); })
    .catch(function (err) { console.error('Organograma: erro ao carregar dados', err); });

})();
