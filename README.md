[README.md](https://github.com/user-attachments/files/32360616/README.md)
# Site da FaTIM

Site da Faculdade de Teologia da Igreja Metodista (FaTIM), com informações institucionais, blog, anuário litúrgico e acesso à plataforma de estudos e ao Portal do Aluno.

## Páginas

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Página inicial, download do edital e redes sociais. |
| `sobre.html` | Apresentação da FaTIM, formação e requisitos de ingresso. |
| `blog.html` | Publicações com foto do autor e texto expansível na mesma página. |
| `anuario-liturgico.html` | Calendário, leituras bíblicas e informações litúrgicas. |

O cabeçalho permite navegar entre as páginas. Os links externos da Plataforma e do Portal do Aluno abrem em uma nova aba. O rodapé contém os ícones de contato por e-mail e WhatsApp.

## Organização dos arquivos

Todos os arquivos devem ficar na mesma pasta, inclusive imagens, ícones e o PDF do edital. Os caminhos são relativos para facilitar a publicação na hospedagem.

| Arquivo | Função |
| --- | --- |
| `styles.css` | Estilos compartilhados pelas quatro páginas. |
| `anuario-liturgico.js` | Navegação e apresentação do calendário. |
| `liturgical-data.js` | Datas, tempos litúrgicos e leituras cadastradas. |
| `pwa.js` | Registro do service worker nas páginas institucionais. |
| `service-worker.js` | Cache dos arquivos e suporte ao acesso offline de conteúdo armazenado. |
| `manifest.webmanifest` | Configuração de instalação do site no celular. |
| `anuario-liturgico.webmanifest` | Configuração de instalação do anuário. |
| `fatim-icon-192.png` e `fatim-icon-512.png` | Ícones de instalação com o logo da FaTIM. |
| Arquivos `.png` e `.svg` | Logos, imagens e ícones usados nas páginas. |

## Visualização local

O site utiliza HTML, CSS e JavaScript, sem exigir compilação ou instalação de dependências.

Abra `index.html` no navegador para visualizar as páginas. Para testar instalação e service worker, utilize um servidor local em `localhost` ou publique o site com HTTPS. Esses recursos não funcionam ao abrir os arquivos diretamente pelo sistema de arquivos.

## Edição manual

### Textos e menu

Edite o arquivo HTML da página correspondente. O menu e o rodapé estão presentes em cada HTML; alterações nesses elementos devem ser aplicadas nas quatro páginas para manter o padrão.

Altere `styles.css` para ajustar cores, fontes, espaçamentos e aparência.

### Publicações do blog

1. Abra `blog.html` em um editor de texto.
2. Copie um bloco completo de `<details class="post-card">` até seu `</details>` correspondente, dentro de `.post-list`.
3. Coloque a foto do autor na mesma pasta do site e ajuste o atributo `src` da imagem.
4. Edite a categoria, o título, o autor e a data.
5. Substitua os parágrafos de `.post-content` pelo texto da publicação.

O bloco `<summary>` apresenta a publicação; ao clicar nele, o leitor abre ou fecha o texto. As publicações de exemplo devem ser substituídas pelo conteúdo definitivo.

### Edital de Ingresso 2026

Coloque o PDF na mesma pasta de `index.html`, com o nome exato:

```text
edital-ingresso-2026.pdf
```

O link da página inicial já está configurado com o atributo `download`. O PDF deve ser fornecido separadamente; sem ele, o link não terá um arquivo para baixar.

Para utilizar outro nome de arquivo, atualize os atributos `href` e `download` do link em `index.html`. Respeite maiúsculas e minúsculas nos nomes enviados à hospedagem.

### Anuário litúrgico

Edite `liturgical-data.js` para atualizar as leituras e informações cadastradas, preservando a estrutura dos dados. Existem campos de exemplo e informações a cadastrar; revise o conteúdo antes de divulgá-lo como definitivo.

O calendário começa a semana no domingo. O link do menu usa `anuario-liturgico.html?hoje=1` para abrir o dia atual. O painel do dia usa um tom claro correspondente à cor litúrgica cadastrada.

## Publicação na hospedagem

1. Envie os arquivos do site para a pasta pública do domínio indicada pela hospedagem (geralmente `public_html`).
2. Mantenha os arquivos HTML, CSS, JavaScript, manifests, imagens e PDF na mesma pasta.
3. Preserve `index.html` como página inicial.
4. Acesse o domínio e confira os menus, os contatos e o download do edital.

Não é necessário enviar `README.md` ou `fatim.zip` para o funcionamento do site. Se utilizar o ZIP, extraia seu conteúdo na pasta pública.

Em atualizações, envie todos os arquivos modificados e os novos arquivos necessários. Quando alterar arquivos utilizados pelo cache, atualize também a versão de `CACHE_NAME` em `service-worker.js` e envie esse arquivo à hospedagem.

Páginas, scripts e estilos priorizam a rede quando há conexão e usam o cache como alternativa offline. Se ainda aparecer uma versão antiga, recarregue a página com `Ctrl + F5` no computador ou feche e reabra o site no celular.

## Instalação no celular

O site possui configuração para instalação como aplicativo web (PWA). A oferta de instalação depende do navegador, do sistema operacional e do uso de HTTPS. O aplicativo instalado usa o logo da FaTIM.

Após uma troca de ícone, uma instalação já existente pode exigir remoção e nova instalação para exibir o ícone atualizado.

## Contatos e links

- Plataforma: <http://fatim.eadplataforma.app>
- Portal do Aluno: <https://fatim.eadplataforma.app/login>
- E-mail: <mailto:contato@fatim.org.br>
- WhatsApp: <https://wa.me/5511914347478>

O login é realizado diretamente na plataforma externa. O site da FaTIM não coleta nem armazena senhas dos alunos.
