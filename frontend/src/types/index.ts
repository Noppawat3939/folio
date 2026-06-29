export interface Entry {
  id: string;
  name: string | null;
  type: string;
  amount: number;
  period: string;
  note: string | null;
}

export interface MonthlySummary {
  type: string;
  total: number;
  period: string;
}

export interface YearlySummary {
  period: string;
  total: number;
}

export interface FetchedData {
  entries: Entry[];
  monthly: MonthlySummary[];
  yearly: YearlySummary[];
}

export interface FormState {
  name: string;
  type: "income" | "expense";
  amount: string;
  note: string;
}
