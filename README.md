# Kapital — Gestão Financeira Pessoal

> Acompanhe suas finanças com clareza e precisão.

Kapital é uma aplicação web completa de finanças pessoais. Gerencie transações, orçamentos por categoria, cofrinhos de poupança e contas fixas mensais — tudo em um painel centralizado, com gráfico de fluxo de caixa e suporte a dois idiomas (PT/EN).

---

## Funcionalidades

| Seção | O que faz |
|---|---|
| **Visão Geral** | Painel com saldo líquido, receitas/despesas do mês, contas pendentes, gráfico de fluxo de caixa dos últimos 6 meses, resumo de orçamentos, transações recentes, cofrinhos e contas fixas |
| **Transações** | Histórico completo com busca por texto, filtros por tipo (receita/despesa) e categoria, ordenação por data, valor ou descrição, e paginação |
| **Orçamentos** | Criação de limites mensais por categoria, barra de progresso de gastos, alerta de limite ultrapassado e histórico das últimas transações por orçamento |
| **Cofrinhos** | Poupança com meta e cor personalizadas, visualização de progresso, depósito e retirada de valores |
| **Contas Fixas** | Cadastro de contas recorrentes com dia de vencimento, marcação de pago/não pago, status de atrasado/a vencer, busca e ordenação |
| **Idiomas** | Alternância PT 🇧🇷 / EN 🇺🇸 em tempo real (preferência salva no navegador) |

---

## Stack Tecnológica

### Frontend
- **[Next.js 14](https://nextjs.org/)** — App Router, Server Components, Server Actions
- **[React 18](https://react.dev/)** + **[TypeScript 5](https://www.typescriptlang.org/)**
- **[Tailwind CSS 3](https://tailwindcss.com/)** — estilização utilitária
- **[Recharts 3](https://recharts.org/)** — gráfico de área com gradiente SVG
- **[Lucide React](https://lucide.dev/)** — ícones
- **[shadcn/ui](https://ui.shadcn.com/)** — base de componentes acessíveis

### Formulários e Validação
- **[React Hook Form 7](https://react-hook-form.com/)** + **[Zod 4](https://zod.dev/)** — validação de esquemas em runtime

### Estado e i18n
- **[Zustand 5](https://zustand-demo.pmnd.rs/)** com middleware `persist` — preferência de idioma salva no `localStorage`

### Backend / Banco de Dados
- **[Supabase](https://supabase.com/)** — PostgreSQL hospedado + autenticação por e-mail/senha
- **[@supabase/ssr](https://supabase.com/docs/guides/auth/server-side)** — autenticação em Server Components e Middleware

### Fontes
- **Fraunces** (titulações) + **Plus Jakarta Sans** (corpo) via Google Fonts

---

## Pré-requisitos

- **Node.js 18+**
- Uma conta no [Supabase](https://supabase.com/) com um projeto criado

---

## Configuração do Banco de Dados

No **Editor SQL** do seu projeto Supabase, execute os seguintes comandos para criar as tabelas necessárias:

```sql
-- Transações
create table transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  amount      numeric(12,2) not null,
  category    text not null,
  date        date not null,
  description text not null,
  type        text check (type in ('income','expense')) not null,
  created_at  timestamptz default now()
);

-- Orçamentos
create table budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  category    text not null,
  max_amount  numeric(12,2) not null,
  created_at  timestamptz default now()
);

-- Cofrinhos
create table pots (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users not null,
  name           text not null,
  target_amount  numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  theme_color    text not null default '#a3a3a3',
  created_at     timestamptz default now()
);

-- Contas fixas
create table recurring_bills (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  name       text not null,
  amount     numeric(12,2) not null,
  due_day    integer check (due_day between 1 and 31) not null,
  category   text not null,
  is_paid    boolean not null default false,
  created_at timestamptz default now()
);
```

Ative o Row Level Security (RLS) para que cada usuário acesse apenas seus próprios dados:

```sql
alter table transactions     enable row level security;
alter table budgets          enable row level security;
alter table pots             enable row level security;
alter table recurring_bills  enable row level security;

create policy "acesso próprio" on transactions    for all using (auth.uid() = user_id);
create policy "acesso próprio" on budgets         for all using (auth.uid() = user_id);
create policy "acesso próprio" on pots            for all using (auth.uid() = user_id);
create policy "acesso próprio" on recurring_bills for all using (auth.uid() = user_id);
```

---

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/cauabackend/Kapital.git
cd Kapital
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Necessário apenas para popular o banco com dados de exemplo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

As chaves estão disponíveis em **Supabase → Project Settings → API**.

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000), crie uma conta e comece a usar.

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com hot-reload |
| `npm run build` | Build de produção otimizado |
| `npm start` | Inicia o servidor de produção |
| `npm run lint` | Verifica o código com ESLint |
| `npm run seed` | Popula o banco com dados fictícios para testes |

> O script `seed` requer `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` e um `USER_ID` válido configurado em `scripts/seed.ts`.

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/                 # Páginas públicas de autenticação
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/           # Callback do Supabase Auth
│   ├── (dashboard)/            # Rotas protegidas (autenticado)
│   │   ├── overview/           # Painel principal
│   │   ├── transactions/       # Histórico de transações
│   │   ├── budgets/            # Orçamentos por categoria
│   │   ├── pots/               # Cofrinhos de poupança
│   │   ├── recurring-bills/    # Contas fixas mensais
│   │   └── layout.tsx          # Layout com sidebar
│   └── globals.css             # Estilos globais e animações
├── components/
│   └── layout/
│       └── sidebar.tsx         # Navegação lateral com toggle de idioma
├── hooks/
│   └── use-t.ts                # Hook de tradução
├── lib/
│   ├── supabase/               # Clientes Supabase (browser / server / middleware)
│   ├── validators/             # Schemas Zod (budget, pot, recurring-bill)
│   ├── translations.ts         # Strings PT e EN
│   └── utils.ts
├── store/
│   ├── language.ts             # Preferência de idioma (Zustand + persist)
│   └── sidebar.ts              # Estado da sidebar
└── types/
    └── database.ts             # Tipos TypeScript das tabelas
```

---

## Arquitetura

O projeto usa o **App Router** do Next.js 14 com o modelo de componentes híbridos:

- **Server Components** — buscam dados diretamente no Supabase sem expor credenciais ao cliente
- **Server Actions** — mutações (criar, editar, excluir) via `"use server"` com revalidação automática de cache
- **Client Components** — interatividade (modais, formulários, toggles, dropdowns)
- **Suspense + `loading.tsx`** — skeleton loading enquanto os dados carregam
- **Middleware** — protege rotas autenticadas e redireciona usuários não logados para `/login`

---

## Licença

MIT © [Cauã Pereira](https://github.com/cauabackend)
