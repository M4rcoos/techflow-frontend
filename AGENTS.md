# Agent: Frontend Architect

## Objetivo

Desenvolver e manter o frontend do sistema **TechFlow SaaS** - um sistema de gestão para assistências técnicas e prestadores de serviço.

---

## Stack tecnológica

- **React 19** com Vite
- **TypeScript** (OBRIGATÓRIO - sem exceções)
- **TailwindCSS** para estilização
- **TanStack Query** (React Query) para gerenciamento de estado
- **React Router** para navegação
- **Sonner** para toasts/notificações
- **Lucide React** para ícones
- **Framer Motion** para animações

---

## Regras obrigatórias

### Tipagem
- Nunca usar `any`
- Nunca usar JavaScript puro
- Sempre tipar:
  - Props de componentes
  - Estados (useState, useReducer)
  - Responses da API
  - Dados de formulários

### Estrutura de código
- Separar lógica de UI dos componentes
- Componentes devem ser pequenos e reutilizáveis
- Cada arquivo deve ter uma única responsabilidade

---

## Sobre o projeto TechFlow

### O que é
Sistema SaaS para gestão de:
- **Clientes** - Cadastro e controle de clientes (PF/PJ)
- **Orçamentos** - Criação e envio de orçamentos
- **Ordens de Serviço** - Gestão de OS
- **Dashboard** - Métricas e relatórios

### Arquitetura atual
```
front-service/
├── src/
│   ├── components/       # Componentes UI reutilizáveis
│   │   └── ui/           # Componentes base (shadcn-like)
│   ├── modules/          # Features do sistema
│   │   ├── auth/         # Login, registro, landing page
│   │   ├── client/       # Gerenciamento de clientes
│   │   ├── budget/       # Gerenciamento de orçamentos
│   │   └── dashboard/    # Página principal
│   ├── services/         # Comunicação com API
│   ├── hooks/           # Hooks personalizados
│   ├── types/           # Tipagens globais
│   └── lib/             # Utilitários e configuração de API
```

### Integração com Backend
- Backend: `backend/` (Node.js + Express + Prisma)
- API REST em `localhost:3002`
- Autenticação via JWT (token em localStorage)

---

## Boas práticas de desenvolvimento

### Services (comunicação com API)
```typescript
// services/client.service.ts
import { api } from '../lib/api';
import type { Client, CreateClientData } from '../types';

interface ListResponse {
  clients: Client[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export const clientService = {
  async list(page = 1, limit = 10): Promise<ListResponse> {
    const response = await api.get('/api/clients', { params: { page, limit } });
    return {
      clients: response.data.data || [],
      pagination: response.data.pagination,
    };
  },
};
```

### Hooks personalizados
```typescript
// hooks/use-clients.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { clientService } from '../services/client.service';

export const useClients = (page = 1, limit = 10) => {
  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, limit],
    queryFn: () => clientService.list(page, limit),
    enabled: !!localStorage.getItem('auth_token'), // Só executa se autenticado
  });

  return {
    clients: data?.clients || [],
    isLoading,
  };
};
```

### Componentes
- Nome em PascalCase: `ClientFormModal.tsx`
- Props tipadas com interface
- Separar lógica de presentation

### Tratamento de erros
- Sempre usar try/catch em services
- Mostrar mensagens amigáveis ao usuário (toast)
- Não expor erros técnicos sensíveis

---

## Autenticação e Segurança

### Fluxo atual
1. Login → Salva token em `auth_token` no localStorage
2. API interceptor adiciona Bearer token automaticamente
3. Rotas protegidas verificam localStorage

### Regras de segurança
- ✅ Token persistido em localStorage (atual implementação)
- ❌ Nunca expor secrets no código
- ❌ Nunca usar dangerouslySetInnerHTML
- Tratar erros 401 redirecionando para login

---

## Como continuar o desenvolvimento

### Para adicionar nova feature
1. Criar módulo em `modules/`
2. Criar service em `services/`
3. Criar tipos em `types/`
4. Criar hook em `hooks/` (se necessário)
5. Criar componentes em `components/`
6. Integrar com backend

### Para criar nova página
1. Criar componente em `modules/[feature]/`
2. Adicionar rota em `App.tsx`
3. Proteger rota se necessário (usar localStorage)

### Para criar modal/formulário
1. Criar componente em `modules/[feature]/`
2. Usar Dialog do shadcn/ui
3. Integrar com service para operações CRUD

---

## Comandos úteis

```bash
# Desenvolvimento
cd front-service
npm run dev

# Build para produção
npm run build

# Verificar tipos
npm run build  # já executa tsc
```

---

## Padrões de nomenclatura

- **Arquivos**: kebab-case (`client-form-modal.tsx`)
- **Componentes**: PascalCase (`ClientFormModal.tsx`)
- **Funções/Variáveis**: camelCase (`createClient`, `isLoading`)
- **Interfaces/Types**: PascalCase (`CreateClientData`)

---

## Tarefas pendientes do projeto

- [x] Landing page com design moderno
- [x] Login e registro de usuários
- [x] Dashboard com estatísticas
- [x] Lista de clientes com paginação
- [x] Criação/edição de clientes
- [x] Lista de orçamentos
- [x] Criação de orçamentos com busca de cliente
- [ ] Detalhes do orçamento
- [ ] Edição de orçamentos
- [ ] Sistema de ordens de serviço (OS)
- [ ] Melhorias no dashboard
- [ ] Tema dark/light

---

## Referências

- Backend API: `backend/src/modules/`
- Frontend antigo: `frontend/` (参考 para funcionalidades)
- Tipos: `src/types/index.ts`

🔐 SEGURANÇA FRONTEND (OBRIGATÓRIO)

O frontend deve seguir regras rígidas de segurança:

🔒 Autenticação
NÃO usar localStorage para tokens
Tokens devem ser armazenados em cookies HTTP-only
Nunca acessar token diretamente no frontend
🔒 JWT
JWT deve conter apenas:
userId
role
NÃO incluir dados sensíveis ou desnecessários
🔒 Logs
Remover TODOS console.log em produção
Nunca logar:
tokens
dados do usuário
respostas completas da API
🔒 Variáveis de ambiente
Nunca expor secrets no frontend
Apenas variáveis públicas com prefixo:
NEXT_PUBLIC_
🔒 Autorização
Frontend NÃO é responsável por segurança
Toda validação deve ocorrer no backend
Frontend apenas controla UI
🔒 Armazenamento
NÃO persistir:
token
dados sensíveis
Evitar Zustand persist para auth
🔒 Requests
Todas requisições devem:
usar interceptor
tratar erros globais
lidar com expiração de sessão
🔒 XSS
Nunca usar dangerouslySetInnerHTML sem sanitização
Sanitizar qualquer HTML vindo do backend