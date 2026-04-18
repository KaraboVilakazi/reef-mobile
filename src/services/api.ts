import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ApiResponse, AuthResponse, Account, TransactionPage,
  MonthlySummary, Budget,
} from '../types/api';

// ── Change this to your Mac's local IP when testing on a real device ──────────
// Run `ipconfig getifaddr en0` in terminal to find your IP
export const BASE_URL = 'http://192.168.8.111:5072/api/v1';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  register: (firstName: string, lastName: string, email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', { firstName, lastName, email, password }),
};

// ── Accounts ─────────────────────────────────────────────────────────────────
export const accountsApi = {
  getAll: () =>
    api.get<ApiResponse<Account[]>>('/accounts'),

  create: (name: string, accountType: string) =>
    api.post<ApiResponse<Account>>('/accounts', { name, accountType }),
};

// ── Transactions ─────────────────────────────────────────────────────────────
export const transactionsApi = {
  getPage: (accountId: string, page = 1, pageSize = 20) =>
    api.get<ApiResponse<TransactionPage>>(`/transactions/${accountId}?page=${page}&pageSize=${pageSize}`),

  deposit: (accountId: string, amount: number, description: string, categoryId: number) =>
    api.post<ApiResponse<unknown>>('/transactions/deposit', { accountId, amount, description, categoryId }),

  withdraw: (accountId: string, amount: number, description: string, categoryId: number) =>
    api.post<ApiResponse<unknown>>('/transactions/withdraw', { accountId, amount, description, categoryId }),

  transfer: (sourceAccountId: string, destinationAccountId: string, amount: number, description: string) =>
    api.post<ApiResponse<unknown>>('/transactions/transfer', { sourceAccountId, destinationAccountId, amount, description }),

  getMonthlySummary: (accountId: string, month: number, year: number) =>
    api.get<ApiResponse<MonthlySummary>>(`/transactions/${accountId}/summary?month=${month}&year=${year}`),
};

// ── Budgets ──────────────────────────────────────────────────────────────────
export const budgetsApi = {
  getAll: (month: number, year: number) =>
    api.get<ApiResponse<Budget[]>>(`/budgets?month=${month}&year=${year}`),

  set: (categoryId: number, limitAmount: number, month: number, year: number) =>
    api.post<ApiResponse<Budget>>('/budgets', { categoryId, limitAmount, month, year }),
};
