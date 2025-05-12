import type { Wallet, Transaction } from "../types";

export async function fetchWallet(address: string): Promise<Wallet> {
	const res = await fetch(`http://localhost:3001/api/wallet/${address}`);
	if (!res.ok) throw new Error("Wallet not found");
	return res.json();
}

export async function fetchWalletTransactions(
	address: string
): Promise<Transaction[]> {
	const res = await fetch(
		`http://localhost:3001/api/wallet/${address}/transactions`
	);
	if (!res.ok) throw new Error("Failed to fetch wallet transactions");
	return res.json();
}
