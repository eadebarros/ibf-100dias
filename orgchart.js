/* ===== IBF ORGANOGRAMA — orgchart.js ===== */

(function () {
  'use strict';

  /* ---- Estado ---- */
  var activeCard = null; // id do nó com card travado (desktop)

  /* ---- Helpers de status ---- */
  function statusLabel(status) {
    if (status === 'confirmed')  return 'Confirmado';
    if (status === 'evaluation') return 'Em avaliação';
    return 'A contratar';
  }

  function statusClass(status) {
    if (status === 'confirmed')  return 'oc-node--confirmed';
    if (status === 'evaluation') return 'oc-node--evaluation';
    return 'oc-node--open';
  }

  /* ---- Renderiza o card de detalhes ---- */
  function renderCard(node) {
    var items = node.responsibilities.map(function (r) {
      return '<li>' + r + '</li>';
    }).join('');

    var badgeClass = 'oc-badge oc-badge--' + node.status;

    return '<div class="oc-card" role="tooltip" aria-label="Detalhes ' + node.name + '">' +
      '<div class="oc-card-header">' +
        '<p class="oc-card-name">' + node.name + '</p>' +
        '<span class="' + badgeClass + '">' + statusLabel(node.status) + '</span>' +
      '</div>' +
      '<p class="oc-card-role">' + node.role + '</p>' +
      '<p class="oc-card-reports">Reporta a: ' + node.reportsTo + '</p>' +
      '<ul class="oc-card-list">' + items + '</ul>' +
    '</div>';
  }

  /* ---- Renderiza um nó ---- */
  function renderNode(node) {
    var nodeClass = 'oc-node ' + statusClass(node.status);
    var isOpen = node.status === 'open';

    var inner = isOpen
      ? '<p class="oc-node-name oc-node-name--open">' + node.role + '</p>' +
        '<span class="oc-badge oc-badge--open">A contratar</span>'
      : '<p class="oc-node-name">' + node.name + '</p>' +
        '<p class="oc-node-role">' + node.role + '</p>';

    return '<div class="oc-node-wrap">' +
      '<div class="' + nodeClass + '" data-id="' + node.id + '" ' +
        'tabindex="0" role="button" aria-expanded="false" ' +
        'aria-label="' + (isOpen ? node.role + ', vaga aberta' : node.name + ', ' + node.role) + '">' +
        inner +
        renderCard(node) +
      '</div>' +
    '</div>';
  }

  /* ---- Renderiza árvore recursiva ---- */
  function renderTree(node) {
    var html = '<li class="oc-tree-item">';
    html += renderNode(node);
    if (node.children && node.children.length > 0) {
      html += '<ul class="oc-tree-children">';
      node.children.forEach(function (child) {
        html += renderTree(child);
      });
      html += '</ul>';
    }
    html += '</li>';
    return html;
  }

  /* ---- Renderiza lista mobile (accordion) ---- */
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

  /* ---- Fecha todos os cards abertos ---- */
  function closeAll() {
    document.querySelectorAll('.oc-node[aria-expanded="true"]').forEach(function (el) {
      el.setAttribute('aria-expanded', 'false');
    });
    activeCard = null;
  }

  /* ---- Eventos desktop (hover + click) ---- */
  function bindDesktopEvents(container) {
    var isMobile = window.matchMedia('(max-width: 640px)').matches;
    if (isMobile) return;

    container.addEventListener('mouseenter', function (e) {
      var node = e.target.closest('.oc-node');
      if (!node) return;
      var id = node.dataset.id;
      if (activeCard && activeCard !== id) return; // card travado em outro nó
      node.setAttribute('aria-expanded', 'true');
    }, true);

    container.addEventListener('mouseleave', function (e) {
      var node = e.target.closest('.oc-node');
      if (!node) return;
      var id = node.dataset.id;
      if (activeCard === id) return; // não fecha se travado
      node.setAttribute('aria-expanded', 'false');
    }, true);

    container.addEventListener('click', function (e) {
      var node = e.target.closest('.oc-node');
      if (!node) return;
      e.stopPropagation();
      var id = node.dataset.id;
      if (activeCard === id) {
        // destrava
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

  /* ---- Eventos mobile (accordion) ---- */
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

    var isMobile = window.matchMedia('(max-width: 640px)').matches;

    if (isMobile) {
      /* Mobile: lista accordion */
      var listHTML = '<div class="oc-list">' + renderList(data.root, 0) + '</div>';
      section.querySelector('.oc-body').innerHTML = listHTML;
      bindMobileEvents(section.querySelector('.oc-body'));
    } else {
      /* Desktop: árvore visual */
      var treeHTML = '<div class="oc-tree-wrap"><ul class="oc-tree">' + renderTree(data.root) + '</ul></div>';
      section.querySelector('.oc-body').innerHTML = treeHTML;
      bindDesktopEvents(section.querySelector('.oc-body'));
    }
  }

  /* ---- Carrega dados e inicializa ---- */
  fetch('./orgchart-data.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { init(data); })
    .catch(function (err) { console.error('Organograma: erro ao carregar dados', err); });

})();
