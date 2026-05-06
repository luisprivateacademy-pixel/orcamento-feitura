# Orçamento de Feitura — Deploy

App de orçamento que roda no navegador (celular/desktop), com chat IA integrado pra preencher por linguagem natural ou foto.

## Estrutura

- `index.html` — o app inteiro (frontend)
- `api/chat.js` — função serverless que segura sua chave da Anthropic e fala com a API
- `package.json` — config mínima

A chave da Anthropic NUNCA fica no celular. Fica só na Vercel, como variável de ambiente. O app no celular pede uma senha simples sua pra liberar o chat.

---

## Passo a passo de deploy (5–10 min)

### 1. Crie uma conta no GitHub (se ainda não tem)

Vai em https://github.com/signup — gratuito.

### 2. Crie um repositório novo

- Clica em **New repository** (botão verde no canto)
- Nome: `orcamento-feitura` (ou o que preferir)
- Marca **Private** (importante: pra ninguém ver seu código)
- Clica em **Create repository**

### 3. Sobe os arquivos

Na página do repositório recém-criado, clica em **uploading an existing file** (link no meio da tela).

Arrasta os 4 arquivos / pastas:
- `index.html`
- `package.json`
- `.gitignore`
- a pasta `api` inteira (com `chat.js` dentro)

Desce a página, escreve uma mensagem qualquer ("primeira versão") e clica em **Commit changes**.

### 4. Crie conta na Vercel e conecte o GitHub

- Vai em https://vercel.com/signup
- Clica em **Continue with GitHub**
- Autoriza

### 5. Importa o projeto

- Na Vercel, clica em **Add New → Project**
- Procura o repositório `orcamento-feitura` e clica em **Import**
- Na tela de configuração, ANTES de clicar em Deploy, clica em **Environment Variables** (expande)

### 6. Configura as duas variáveis

Adiciona DUAS variáveis de ambiente:

| Nome | Valor |
|------|-------|
| `ANTHROPIC_API_KEY` | sua chave que começa com `sk-ant-...` (pega em console.anthropic.com → API Keys) |
| `APP_PASSWORD` | uma senha qualquer que você vai usar pra entrar (ex: `feitura2025` ou algo mais forte) |

### 7. Clica em **Deploy**

Espera 1-2 minutos. Vai aparecer fogos de artifício e um link tipo `https://orcamento-feitura-xxx.vercel.app`.

### 8. Abre no celular

- Abre o link no Safari (iPhone) ou Chrome (Android)
- Vai pedir senha quando você clicar no chat — usa a senha que você configurou em `APP_PASSWORD`
- (iPhone) Toca no botão de compartilhar → **Adicionar à Tela Inicial**. Vira um app.
- (Android) Menu do navegador → **Adicionar à tela inicial**.

Pronto.

---

## Pra trocar a senha depois

Vercel → seu projeto → **Settings → Environment Variables** → edita `APP_PASSWORD` → salva → na aba **Deployments**, clica nos 3 pontinhos do último deploy e em **Redeploy**.

## Pra atualizar o app

É só editar os arquivos no GitHub (clica no arquivo → ícone de lápis → edita → Commit). A Vercel faz redeploy automático em ~1 min.

## Custos

- Vercel: grátis (hobby tier, mais que suficiente)
- GitHub: grátis
- Anthropic: você paga só pelo uso da IA — uma mensagem de chat custa ~R$0,05, uma foto de lista ~R$0,15. Configura limite de gasto em console.anthropic.com → Settings → Limits pra dormir tranquilo.

## Se algo der errado

- "Senha inválida" → confere se digitou igual à variável `APP_PASSWORD` na Vercel.
- "Servidor não configurado" → faltou definir `ANTHROPIC_API_KEY` ou `APP_PASSWORD` na Vercel.
- Outra coisa → me chama de volta no chat.
