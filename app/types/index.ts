export type Transaction = {
	id: number;
	hash: string;
	blockId: number | null;
	timestamp: string;
	value: number;
	fee: number;
	sender?: string;
	receiver?: string;
	chain: "bitcoin" | "ethereum";
};

export type Wallet = {
	address: string;
	balance: number | null;
	txCount: number | null;
	firstSeen: string | null;
	lastSeen: string | null;
};

export type Stats = {
	id: number;
	createdAt: string;
	hashRate: number | null;
	mempoolTxCount: number | null;
	marketCapUsd: number | null;
};
