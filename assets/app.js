(function () {
  'use strict';
  var DATA = window.LH_GALLERY;
  var LABEL = { pd: 'Public domain', link: 'In copyright', respect: 'Culturally sensitive' };
  var state = { status: 'all', query: '' };

  var gallery = document.getElementById('gallery');
  var toc = document.getElementById('toc');
  var q = document.getElementById('q');

  document.getElementById('updated').textContent = formatDate(DATA.updated);

  function formatDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function matches(item) {
    if (state.status !== 'all' && item.status !== state.status) return false;
    if (!state.query) return true;
    var hay = norm([item.id, item.title, item.creator, item.place, item.purpose, item.date].join(' '));
    return norm(state.query).split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function archiveUrl(url) { return 'https://web.archive.org/web/2026/' + url; }

  function card(item) {
    var links = el('ul', { class: 'links' });
    item.links.forEach(function (l) {
      links.appendChild(el('li', null, [el('a', { href: l.url, target: '_blank', rel: 'noopener', text: l.label })]));
    });
    if (item.links.length) {
      links.appendChild(el('li', { class: 'archive' }, [
        el('a', { href: archiveUrl(item.links[0].url), target: '_blank', rel: 'noopener', text: 'Archived copy (if a link breaks)' })
      ]));
    }
    var idBtn = el('button', { class: 'gid', type: 'button', title: 'Copy a link to this entry', text: 'Gallery ' + item.id });
    idBtn.addEventListener('click', function () { copyLink(item.id); });
    var meta = [item.creator, item.date].filter(function (x) { return x && x !== '—'; }).join(' · ');
    return el('article', { class: 'card', id: 'g' + item.id.replace('.', '-'), 'data-id': item.id }, [
      el('div', { class: 'card-top' }, [idBtn, el('span', { class: 'badge ' + item.status, text: LABEL[item.status] })]),
      el('h3', { text: item.title }),
      meta ? el('p', { class: 'meta', text: meta }) : null,
      item.place && item.place !== '—' ? el('p', { class: 'meta', text: item.place }) : null,
      el('p', { class: 'purpose', text: item.purpose }),
      item.note ? el('p', { class: 'note', text: item.note }) : null,
      links
    ]);
  }

  function render() {
    gallery.innerHTML = '';
    var shown = 0;
    DATA.chapters.forEach(function (ch) {
      var items = DATA.items.filter(function (i) { return i.chapter === ch.n && matches(i); });
      if (!items.length) return;
      shown += items.length;
      var grid = el('div', { class: 'cards' });
      items.forEach(function (i) { grid.appendChild(card(i)); });
      gallery.appendChild(el('section', { class: 'chapter', id: 'ch' + ch.n }, [
        el('div', { class: 'chapter-head' }, [el('span', { class: 'num', text: String(ch.n) }), el('h2', { text: ch.title })]),
        grid
      ]));
    });
    if (!shown) gallery.appendChild(el('p', { class: 'empty', text: 'No entries match. Try a gallery number such as 4.3, or clear the filter.' }));
  }

  function buildToc() {
    DATA.chapters.forEach(function (ch) {
      var count = DATA.items.filter(function (i) { return i.chapter === ch.n; }).length;
      var a = el('a', { href: '#ch' + ch.n, title: count + ' entries' }, [
        el('span', { class: 'n', text: String(ch.n) }), el('span', { class: 't', text: ch.title })
      ]);
      toc.appendChild(el('li', null, [a]));
    });
  }

  function flash(id) {
    var node = document.getElementById('g' + id.replace('.', '-'));
    if (!node) return false;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    node.classList.add('flash');
    setTimeout(function () { node.classList.remove('flash'); }, 2400);
    return true;
  }

  function goTo(raw) {
    var m = String(raw).trim().match(/^(?:gallery\s*)?(\d{1,2})[.\-](\d{1,2})$/i);
    if (m) {
      var id = Number(m[1]) + '.' + Number(m[2]);
      resetFilters();
      if (!flash(id)) toast('There is no Gallery ' + id + ' — check the number in the book.');
      else history.replaceState(null, '', '#' + id);
      return true;
    }
    var c = String(raw).trim().match(/^(?:ch|chapter)\s*(\d{1,2})$/i);
    if (c) {
      resetFilters();
      var sec = document.getElementById('ch' + Number(c[1]));
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      return true;
    }
    return false;
  }

  function resetFilters() {
    if (state.status === 'all' && !state.query) return;
    state.status = 'all'; state.query = ''; q.value = '';
    setChips(); render();
  }

  function setChips() {
    document.querySelectorAll('.chip').forEach(function (b) { b.classList.toggle('on', b.dataset.status === state.status); });
  }

  function copyLink(id) {
    var url = location.origin + location.pathname + '#' + id;
    var done = function () { toast('Link to Gallery ' + id + ' copied'); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, function () { toast(url); });
    else toast(url);
    history.replaceState(null, '', '#' + id);
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  // events
  document.getElementById('finder').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!goTo(q.value)) { state.query = q.value.trim(); render(); }
  });
  q.addEventListener('input', function () {
    if (/^(?:gallery\s*)?\d{1,2}[.\-]\d{0,2}$/i.test(q.value.trim())) return; // wait for Enter on numbers
    state.query = q.value.trim(); render();
  });
  document.querySelectorAll('.chip').forEach(function (b) {
    b.addEventListener('click', function () { state.status = b.dataset.status; setChips(); render(); });
  });

  // highlight current chapter in the table of contents
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          toc.querySelectorAll('a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
  }
  function observe() { if (io) document.querySelectorAll('.chapter').forEach(function (s) { io.observe(s); }); }

  function fromHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (!h || h === 'top' || h === 'about') return;
    goTo(h.replace(/^g/, '').replace('-', '.'));
  }

  buildToc();
  render();
  observe();
  window.addEventListener('hashchange', fromHash);
  setTimeout(fromHash, 50);
})();
