export interface User {
  id: string;
  name: string;
  email?: string;
  company_name?: string;
  avatar?: string;
  role?: string;
  has_seen_onboarding: boolean;
}

export interface Address {
  id: string;
  street: string;
  number: number;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  complement?: string;
}

export interface ClientType {
  id: string;
  name: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Client {
  id: string;
  client_type: ClientType;
  client_type_id: string;
  company_name?: string;
  client_name?: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  cpf?: string;
  address?: Address;
  address_id?: string;
  owner_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetStatus {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface BudgetItemService {
  id: string;
  budget_item_id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  name: string;
  model?: string;
  mark?: string;
  quantity: number;
  total: number;
  reported_problem: string;
  diagnosed_problem?: string;
  service_performed?: string;
  services?: BudgetItemService[];
}

export interface Budget {
  id: string;
  code: string;
  public_token?: string;
  client: Client;
  client_id: string;
  createdBy: User;
  created_by_id: string;
  owner_id: string;
  owner?: {
    company_name: string;
    phone?: string;
    email?: string;
    cnpj?: string;
    address?: {
      street: string;
      number: number;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zip_code: string;
    };
  };
  status: BudgetStatus;
  budget_status_id: string;
  total?: number;
  notes?: string;
  valid_until?: string;
  previous_status?: string | null;
  items: BudgetItem[];
  created_at: string;
  updated_at: string;
  updatedBy?: { name: string } | null;
}

export interface BudgetListItem {
  id: string;
  code: string;
  public_token?: string;
  client: {
    id: string;
    name: string;
    phone?: string;
  };
  status: string;
  total: number;
  itemsCount: number;
  equipmentPreview: string[];
  validUntil?: string | null;
  previousStatus?: string | null;
  createdAt: string;
  createdBy?: { name: string };
  updatedBy?: { name: string; role: string } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
  pendingVerification?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  company_name: string;
  cnpj?: string;
  phone?: string;
  name: string;
  email: string;
  password: string;
  address: {
    street: string;
    number: number;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
}

export interface CreateClientData {
  client_type_id: string;
  company_name?: string;
  client_name?: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  cpf?: string;
  address?: {
    street: string;
    number: number;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    complement?: string;
  };
}

export interface CreateBudgetData {
  client_id: string;
  notes?: string;
  valid_until?: string;
  items: {
    name: string;
    model?: string | null;
    mark?: string | null;
    quantity: number;
    reported_problem: string;
    diagnosed_problem?: string | null;
    services?: {
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
}

export type BudgetStatusName = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type ServiceOrderStatusName = 'OPEN' | 'IN_PROGRESS' | 'PAUSED' | 'DONE' | 'CANCELED';
