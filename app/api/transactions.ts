import type { Transaction } from "../types";

export async function fetchTransactions(page: number): Promise<{
	transactions: Transaction[];
	totalPages: number;
}> {
	const res = await fetch(
		`http://localhost:3001/api/transactions?page=${page}`
	);
	if (!res.ok) throw new Error("Failed to fetch transactions");
	return res.json();
}
