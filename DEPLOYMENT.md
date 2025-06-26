# 🚀 Guia de Deploy - PortConnect

Este documento fornece instruções detalhadas para fazer deploy do PortConnect em diferentes plataformas.

## 📋 Pré-requisitos

1. **Conta no Supabase** configurada com o banco de dados
2. **Variáveis de ambiente** configuradas
3. **Build funcionando** localmente

## 🌐 Opções de Deploy

### 1. Netlify (Recomendado)

#### Deploy Manual
1. Execute a build:
   ```bash
   npm run build
   ```
2. Acesse [Netlify](https://netlify.com)
3. Arraste a pasta `dist` para o deploy

#### Deploy Automático via Git
1. Conecte seu repositório GitHub ao Netlify
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. O deploy será automático a cada push

### 2. Vercel

#### Deploy via CLI
```bash
npm install -g vercel
vercel --prod
```

#### Deploy via Git
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático configurado

### 3. GitHub Pages

```bash
npm install --save-dev gh-pages
```

Adicione ao `package.json`:
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

Execute:
```bash
npm run build
npm run deploy
```

## 🔧 Configuração de Variáveis de Ambiente

### Netlify
1. Site Settings → Environment Variables
2. Adicione:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

### Vercel
1. Project Settings → Environment Variables
2. Adicione as mesmas variáveis acima

### GitHub Actions
1. Repository Settings → Secrets and Variables → Actions
2. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `NETLIFY_AUTH_TOKEN` (se usando Netlify)
   - `NETLIFY_SITE_ID` (se usando Netlify)

## 🗄️ Configuração do Banco de Dados

1. Execute o script SQL no Supabase:
   ```sql
   -- Conteúdo do arquivo supabase-schema.sql
   ```

2. Configure as políticas RLS (Row Level Security)

3. Teste a conexão localmente antes do deploy

## ✅ Checklist de Deploy

- [ ] Build local funcionando (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados Supabase configurado
- [ ] Testes passando (`npm run lint`)
- [ ] Assets (imagens) na pasta `public`
- [ ] Configuração de redirects para SPA

## 🔍 Troubleshooting

### Erro: "Failed to load module"
- Verifique se todas as dependências estão instaladas
- Execute `npm ci` para instalação limpa

### Erro: "Supabase connection failed"
- Verifique as variáveis de ambiente
- Confirme se a URL e chave estão corretas
- Teste a conexão no Supabase dashboard

### Erro: "404 on page refresh"
- Configure redirects para SPA (já incluído nos arquivos de config)
- Verifique se `netlify.toml` ou `vercel.json` estão corretos

### Assets não carregam
- Verifique se as imagens estão na pasta `public`
- Confirme os caminhos das imagens no código

## 📊 Monitoramento

### Netlify
- Analytics disponível no dashboard
- Logs de build e deploy
- Formulários e funções serverless

### Vercel
- Analytics integrado
- Logs em tempo real
- Edge functions disponíveis

## 🔄 CI/CD

O projeto inclui configuração para GitHub Actions que:
- Executa testes em múltiplas versões do Node.js
- Faz build e deploy automático
- Executa linting e type checking

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de build
2. Confirme as variáveis de ambiente
3. Teste localmente primeiro
4. Abra uma issue no repositório

---

**Deploy realizado com sucesso? Não esqueça de testar todas as funcionalidades!** 🎉
