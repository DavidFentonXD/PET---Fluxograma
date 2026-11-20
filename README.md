# PET-Saúde Digital · Central de Fluxos (protótipo)

Site de consulta para profissionais de saúde: categorias e PDFs (fluxogramas) lidos direto na página.
**Todo o conteúdo é de exemplo.** Nenhuma orientação clínica foi incluída.

## Estrutura
```
├── index.html            início (apresentação, busca, categorias)
├── pages/
│   ├── categorias.html   categorias, busca e cards dos PDFs
│   └── documento.html    leitor de PDF
├── documentos/           PDFs demonstrativos (troque pelos oficiais, mantendo o nome ou editando js/dados.js)
├── assets/images/logo-oficial.png
├── css/style.css
├── js/dados.js           categorias, PDFs e fluxogramas (edite aqui)
├── js/script.js
└── js/vendor/            leitor PDF.js (Apache 2.0), sem depender de internet externa
```

## Acrescentar um PDF
1. Copie o fluxograma em PDF para `documentos/` (nome em minúsculas, sem espaços).
2. Em `js/dados.js`, na lista `ITENS`, acrescente:
   `{ id: 'meu-doc', tipo: 'pdf', categoria: 'Saúde do Adulto', titulo: 'Nome do documento', resumo: 'Uma frase.', arquivo: 'documentos/meu-doc.pdf' }`

Os fluxogramas são os próprios PDFs. O site não redesenha nem altera o documento oficial.

## Publicar no GitHub Pages
Crie um repositório público, envie todos os arquivos e ative Settings > Pages (branch `main`, pasta `/ (root)`).
Publicado, o PDF aparece na própria página, inclusive no celular. Aberto direto do computador (dois cliques), o site usa o leitor do navegador.

## Cores da logo
Azul-marinho `#153A60` · Azul institucional `#026E9C` · Azul PET `#459FD8` · Laranja `#E9521E` (botões com texto branco: `#D44313`).
