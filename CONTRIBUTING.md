# 🤝 Contribuindo para o PortConnect

Obrigado por considerar contribuir para o PortConnect! Este documento fornece diretrizes para contribuições.

## 📋 Código de Conduta

Este projeto adere ao código de conduta. Ao participar, você deve manter este código.

## 🚀 Como Contribuir

### 🐛 Reportando Bugs

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/seu-usuario/port-connect/issues)
2. Se não encontrar, crie uma nova issue com:
   - Título claro e descritivo
   - Descrição detalhada do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Informações do ambiente (OS, browser, versão)

### 💡 Sugerindo Melhorias

1. Abra uma issue com o label "enhancement"
2. Descreva claramente a melhoria proposta
3. Explique por que seria útil para o projeto
4. Inclua mockups ou exemplos se possível

### 🔧 Contribuindo com Código

#### Setup do Ambiente de Desenvolvimento

1. Fork o repositório
2. Clone seu fork:
   ```bash
   git clone https://github.com/seu-usuario/port-connect.git
   ```
3. Instale as dependências:
   ```bash
   cd port-connect
   npm install
   ```
4. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o .env com suas configurações
   ```
5. Execute o projeto:
   ```bash
   npm run dev
   ```

#### Processo de Desenvolvimento

1. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```
2. Faça suas alterações seguindo os padrões do projeto
3. Teste suas alterações
4. Commit suas mudanças:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```
5. Push para sua branch:
   ```bash
   git push origin feature/nome-da-feature
   ```
6. Abra um Pull Request

## 📝 Padrões de Código

### Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` mudanças na documentação
- `style:` formatação, ponto e vírgula, etc
- `refactor:` refatoração de código
- `test:` adição ou correção de testes
- `chore:` mudanças no build, ferramentas, etc

### Estilo de Código

- Use TypeScript para type safety
- Siga as configurações do ESLint e Prettier
- Use nomes descritivos para variáveis e funções
- Adicione comentários para lógica complexa
- Mantenha componentes pequenos e focados

### Estrutura de Arquivos

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI reutilizáveis
│   └── ...
├── contexts/           # Context providers
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── types/              # Definições de tipos TypeScript
└── ...
```

## 🧪 Testes

- Escreva testes para novas funcionalidades
- Mantenha a cobertura de testes alta
- Execute os testes antes de fazer commit:
  ```bash
  npm run test
  ```

## 📚 Documentação

- Atualize o README.md se necessário
- Documente novas APIs ou componentes
- Inclua exemplos de uso quando apropriado

## 🔍 Review Process

1. Todos os PRs passam por review
2. Pelo menos um maintainer deve aprovar
3. Todos os checks de CI devem passar
4. O código deve seguir os padrões estabelecidos

## 🎯 Prioridades

Áreas onde contribuições são especialmente bem-vindas:

- 🐛 Correções de bugs
- 📱 Melhorias de responsividade
- ♿ Melhorias de acessibilidade
- 🎨 Melhorias de UI/UX
- 📊 Novas funcionalidades de relatórios
- 🔧 Otimizações de performance

## 📞 Contato

Se tiver dúvidas sobre como contribuir, abra uma issue ou entre em contato com os maintainers.

---

Obrigado por contribuir! 🚀
