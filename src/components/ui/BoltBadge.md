# BoltBadge Component

O componente `BoltBadge` é usado para exibir o badge obrigatório do Bolt.new no hackathon. Ele oferece múltiplas variações para diferentes contextos de uso.

## Uso Básico

```tsx
import BoltBadge from './ui/BoltBadge'

// Badge padrão fixo no canto inferior direito
<BoltBadge />

// Badge compacto inline
<BoltBadge variant="compact" position="inline" />

// Badge apenas com ícone
<BoltBadge variant="icon-only" position="inline" />
```

## Props

### `variant`
- **Tipo**: `'default' | 'compact' | 'icon-only'`
- **Padrão**: `'default'`
- **Descrição**: Define o estilo visual do badge

#### Variações:
- **`default`**: Logo completa "Powered by Bolt.new" (ideal para footer/canto da tela)
- **`compact`**: Logo circular + texto "Bolt.new" (ideal para header)
- **`icon-only`**: Apenas logo circular (ideal para espaços pequenos)

### `position`
- **Tipo**: `'fixed' | 'inline'`
- **Padrão**: `'fixed'`
- **Descrição**: Define o posicionamento do badge

#### Posições:
- **`fixed`**: Posição fixa no canto inferior direito da tela
- **`inline`**: Posicionamento inline no fluxo do documento

### `className`
- **Tipo**: `string`
- **Padrão**: `''`
- **Descrição**: Classes CSS adicionais para customização

## Exemplos de Uso

### Badge Principal (Footer)
```tsx
// Usado no Layout principal - posição fixa
<BoltBadge variant="default" position="fixed" />
```

### Badge no Header
```tsx
// Usado no header junto ao logo
<BoltBadge variant="compact" position="inline" />
```

### Badge em Cards ou Componentes
```tsx
// Para uso em cards ou outros componentes
<BoltBadge 
  variant="icon-only" 
  position="inline" 
  className="ml-2" 
/>
```

## Assets Utilizados

O componente utiliza as seguintes imagens da pasta `src/assets/`:

- `logotext_poweredby_360w.png` - Logo completa com texto "Powered by"
- `black_circle_360x360.png` - Logo circular preta
- `white_circle_360x360.png` - Logo circular branca (reservada para uso futuro)

## Acessibilidade

- Todos os badges incluem `alt` text apropriado
- Links abrem em nova aba com `target="_blank"` e `rel="noopener noreferrer"`
- Hover states e animações suaves para feedback visual
- Suporte a navegação por teclado

## Animações

- Hover scale effect (105%)
- Transições suaves de shadow
- Duração de 200ms para todas as animações

## Requisitos do Hackathon

Este componente atende aos requisitos obrigatórios do hackathon Bolt.new:
- ✅ Badge visível e proeminente
- ✅ Link direto para https://bolt.new/
- ✅ Design profissional e integrado
- ✅ Múltiplas opções de exibição
