/* Central de Fluxos · comportamento das páginas. Sem bibliotecas externas. */
(function () {
  var P = window.PET, B = document.body, ROOT = B.dataset.root || '', pg = B.dataset.pagina;
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function param(k) { return new URLSearchParams(location.search).get(k) || ''; }
  function item(id) { return P.ITENS.filter(function (i) { return i.id === id; })[0]; }
  function icone(d) { return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#026E9C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; }
  function urlCat(n) { return ROOT + 'pages/categorias.html?cat=' + encodeURIComponent(n) + '#lista'; }
  function urlItem(i) { return ROOT + 'pages/documento.html?id=' + i.id; }
  function contagem(cat) {
    var n = P.ITENS.filter(function (i) { return i.categoria === cat; }).length;
    return n ? n + (n > 1 ? ' fluxos' : ' fluxo') : 'Em preparo';
  }
  function cartoes() {
    var el = $('#categorias'); if (!el) return;
    el.innerHTML = P.CATEGORIAS.map(function (c) {
      return '<li><a class="cat" href="' + urlCat(c.nome) + '">' + icone(c.icone) + '<span><b>' + esc(c.nome) + '</b><small>' + contagem(c.nome) + '</small></span></a></li>';
    }).join('');
  }
  function linhaItem(i) {
    return '<li><article class="cartao-doc"><div class="sel"><span class="etiqueta">EXEMPLO</span><span class="fmt">PDF</span>' + '</div>' +
      '<h3>' + esc(i.titulo) + '</h3><span class="cat-nome">' + esc(i.categoria) + '</span><p>' + esc(i.resumo) + '</p><div class="bt">' +
      '<a class="botao" href="' + urlItem(i) + '">Visualizar PDF</a><a class="botao claro" href="' + ROOT + i.arquivo + '" download>Baixar PDF</a></div></article></li>';
  }

  if (pg === 'inicio') cartoes();

  if (pg === 'categorias') {
    var cat = param('cat'), q = param('q'); $('#q').value = q;
    cartoes();
    document.querySelectorAll('#categorias .cat').forEach(function (a) {
      if (cat && decodeURIComponent(a.search.split('cat=')[1].split('&')[0]) === cat) a.setAttribute('aria-current', 'true');
    });
    var t = norm(q.trim());
    var lista = P.ITENS.filter(function (i) { return (!cat || i.categoria === cat) && (!t || norm(i.titulo + ' ' + i.categoria + ' ' + i.resumo).indexOf(t) >= 0); });
    $('#lista-titulo').textContent = t ? 'Resultado da busca' : cat || 'Todos os fluxogramas';
    $('#lista-itens').innerHTML = lista.length ? lista.map(linhaItem).join('') :
      '<li class="vazio">' + (cat && !t ? 'Ainda não há fluxogramas nesta categoria. Eles serão acrescentados em breve.' : 'Nada encontrado. Tente outra palavra ou escolha uma categoria.') + '</li>';
    if (cat || q) $('#limpar').hidden = false;
  }

  if (pg === 'documento') {
    var d = item(param('id'));
    if (!d || d.tipo !== 'pdf') { $('#doc').innerHTML = '<p class="vazio">Fluxograma não encontrado. <a href="categorias.html">Ver categorias</a>.</p>'; }
    else {
      document.title = d.titulo + ' · Central de Fluxos';
      $('#doc-titulo').textContent = d.titulo; $('#doc-cat').textContent = d.categoria + ' · Exemplo demonstrativo (não é o fluxo oficial)';
      $('#trilha-cat').textContent = d.categoria; $('#trilha-cat').href = urlCat(d.categoria); $('#trilha-fim').textContent = d.titulo;
      var arq = ROOT + d.arquivo;
      $('#abrir').href = arq; $('#baixar').href = arq;
      var FALHA = '<div class="sem-pdf"><p>Não foi possível mostrar o PDF aqui.</p><a class="botao" href="' + arq + '" target="_blank" rel="noopener">Abrir o PDF em outra aba</a></div>';
      function nativo() {
        $('#leitor').innerHTML = '<object data="' + arq + '#view=FitH" type="application/pdf" aria-label="' + esc(d.titulo) + '">' + FALHA + '</object>';
      }
      /* Publicado na internet: PDF.js desenha as páginas (funciona também no celular). Aberto direto do computador: leitor do navegador. */
      if (location.protocol === 'file:') nativo();
      else {
        $('#leitor').classList.add('paginas'); $('#leitor').innerHTML = '<p class="carregando">Carregando o documento…</p>';
        var sc = document.createElement('script');
        sc.src = ROOT + 'js/vendor/pdf.min.js';
        sc.onerror = function () { $('#leitor').classList.remove('paginas'); nativo(); };
        sc.onload = function () {
          pdfjsLib.GlobalWorkerOptions.workerSrc = ROOT + 'js/vendor/pdf.worker.min.js';
          pdfjsLib.getDocument(arq).promise.then(function (pdf) {
            var box = $('#leitor'); box.innerHTML = '';
            var larg = Math.min(box.clientWidth - 8, 900), seq = Promise.resolve();
            for (var n = 1; n <= pdf.numPages; n++) (function (n) {
              seq = seq.then(function () { return pdf.getPage(n); }).then(function (pag) {
                var v0 = pag.getViewport({ scale: 1 }), k = larg / v0.width, dpr = window.devicePixelRatio || 1;
                var v = pag.getViewport({ scale: k * dpr }), cv = document.createElement('canvas');
                cv.width = v.width; cv.height = v.height; cv.style.width = larg + 'px'; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Página ' + n + ' de ' + pdf.numPages);
                box.appendChild(cv);
                return pag.render({ canvasContext: cv.getContext('2d'), viewport: v }).promise;
              });
            })(n);
          }).catch(function () { $('#leitor').classList.remove('paginas'); $('#leitor').innerHTML = FALHA; });
        };
        document.head.appendChild(sc);
      }
      var outros = P.ITENS.filter(function (i) { return i.categoria === d.categoria && i.id !== d.id; });
      $('#outros').innerHTML = outros.length ? outros.map(linhaItem).join('') : '<li class="vazio">Não há outros fluxogramas nesta categoria por enquanto.</li>';
      $('#voltar-cat').href = urlCat(d.categoria);
    }
  }
})();
