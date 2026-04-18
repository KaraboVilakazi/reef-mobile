export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Account {
  id: string;
  name: string;
  accountType: 'Cheque' | 'Savings' | 'FixedDeposit';
  balance: number;
  currency: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'Income' | 'Expense' | 'Transfer';
  amount: number;
  balanceAfter: number;
  description: string;
  categoryName: string;
  transactionDate: string;
  destinationAccountId?: string;
}

export interface TransactionPage {
  items: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  byCategory: CategorySpend[];
}

export interface CategorySpend {
  category: string;
  amount: number;
}

export interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  actualSpend: number;
  remainingAmount: number;
  burnRate: number;
  isOverBudget: boolean;
  isProjectedToOverrun: boolean;
  month: number;
  year: number;
}
