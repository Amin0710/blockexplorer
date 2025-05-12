import express from "express";
import cors from "cors";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "express";

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

app.use(cors());

app.get("/", (_req, res) => {
	res.send("Backend with TypeScript is running! 🚀");
});

async function fetchAndStoreStats() {
	try {
		const response = await axios.get("https://api.blockchair.com/stats");
		const btcStats = response.data?.data?.bitcoin?.data;

		if (!btcStats) return;

		await prisma.stats.create({
			data: {
				hashRate: parseFloat(btcStats.hashrate_24h),
				mempoolTxCount: btcStats.mempool_transactions,
				marketCapUsd: btcStats.market_price_usd,
			},
		});

		console.log(`[✅] Stats saved at ${new Date().toLocaleTimeString()}`);
	} catch (error) {
		console.error("❌ Failed to fetch stats:", error);
	}
}

async function fetchAndUpdateBitcoinData() {
	try {
		const response = await axios.get(
			"https://api.blockchair.com/bitcoin/transactions?q=is_coinbase(false)&limit=10"
		);

		const transactions = response.data?.data;
		if (!transactions || !Array.isArray(transactions)) return;

		for (const tx of transactions) {
			const txDetails = await axios.get(
				`https://api.blockchair.com/bitcoin/dashboards/transaction/${tx.hash}`
			);

			const inputs = txDetails.data?.data?.[tx.hash]?.inputs;
			const outputs = txDetails.data?.data?.[tx.hash]?.outputs;

			const sender = inputs?.[0]?.recipient ?? "unknown";
			const receiver = outputs?.[0]?.recipient ?? "unknown";

			for (const input of inputs ?? []) {
				const sender = input.recipient;
				const value = input.value / 1e8;

				if (sender) {
					await prisma.wallet.upsert({
						where: { address: sender },
						update: {
							lastSeen: new Date(),
							txCount: { increment: 1 },
							balance: { decrement: value },
						},
						create: {
							address: sender,
							balance: -value,
							txCount: 1,
							firstSeen: new Date(),
							lastSeen: new Date(),
						},
					});
				}
			}

			for (const output of outputs ?? []) {
				const receiver = output.recipient;
				const value = output.value / 1e8;

				if (receiver) {
					await prisma.wallet.upsert({
						where: { address: receiver },
						update: {
							lastSeen: new Date(),
							txCount: { increment: 1 },
							balance: { increment: value },
						},
						create: {
							address: receiver,
							balance: value,
							txCount: 1,
							firstSeen: new Date(),
							lastSeen: new Date(),
						},
					});
				}
			}

			// Store transaction
			await prisma.transaction.upsert({
				where: { hash: tx.hash },
				update: { sender, receiver },
				create: {
					hash: tx.hash,
					chain: "bitcoin",
					blockId: tx.block_id,
					timestamp: new Date(tx.time),
					value: tx.output_total / 1e8,
					fee: tx.fee / 1e8,
					sender,
					receiver,
				},
			});
		}

		console.log(`[✅] Synced ${transactions.length} BTC transactions`);
	} catch (error) {
		console.error("❌ Failed to fetch transactions:", error);
	}
}

async function fetchAndUpdateEthereumData() {
	try {
		const response = await axios.get(
			"https://api.blockchair.com/ethereum/transactions?limit=10"
		);

		const transactions = response.data?.data;
		if (!transactions || !Array.isArray(transactions)) return;

		for (const tx of transactions) {
			if (!tx.hash || !tx.sender || !tx.recipient) {
				console.warn("❌ Skipping invalid ETH tx:", tx);
				continue;
			}

			const hash = tx.hash;
			const sender = tx.sender;
			const receiver = tx.recipient;
			const value = parseFloat(tx.value) / 1e18;
			const fee = parseFloat(tx.fee || "0") / 1e18;

			if (value === 0) continue;

			await prisma.wallet.upsert({
				where: { address: sender },
				update: {
					lastSeen: new Date(),
					txCount: { increment: 1 },
					balance: { decrement: value },
				},
				create: {
					address: sender,
					balance: -value,
					txCount: 1,
					firstSeen: new Date(),
					lastSeen: new Date(),
				},
			});

			await prisma.wallet.upsert({
				where: { address: receiver },
				update: {
					lastSeen: new Date(),
					txCount: { increment: 1 },
					balance: { increment: value },
				},
				create: {
					address: receiver,
					balance: value,
					txCount: 1,
					firstSeen: new Date(),
					lastSeen: new Date(),
				},
			});

			// Store transaction
			await prisma.transaction.upsert({
				where: { hash },
				update: { sender, receiver },
				create: {
					hash,
					chain: "ethereum",
					blockId: tx.block_id,
					timestamp: new Date(tx.time),
					value,
					fee,
					sender,
					receiver,
				},
			});
		}

		console.log(`[✅] Synced ${transactions.length} ETH transactions`);
	} catch (error) {
		console.error("❌ Failed to fetch ETH transactions:", error);
	}
}

// Initial fetch
fetchAndStoreStats();
fetchAndUpdateBitcoinData();
fetchAndUpdateEthereumData();

// Auto-refresh every 60 seconds
setInterval(fetchAndStoreStats, 60_000);
setInterval(fetchAndUpdateBitcoinData, 60_000);
setInterval(fetchAndUpdateEthereumData, 60_000);

// SSE for live stats
app.get("/events/stats", async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	const sendLatestStats = async () => {
		const latest = await prisma.stats.findFirst({
			orderBy: { createdAt: "desc" },
		});

		if (latest) {
			res.write(`data: ${JSON.stringify(latest)}\n\n`);
		}
	};

	await sendLatestStats();
	const intervalId = setInterval(sendLatestStats, 60_000);

	req.on("close", () => {
		clearInterval(intervalId);
		res.end();
	});
});

app.get("/api/transactions", async (req, res) => {
	const page = parseInt(req.query.page as string) || 1;
	const pageSize = 10;
	const skip = (page - 1) * pageSize;

	const [transactions, total] = await Promise.all([
		prisma.transaction.findMany({
			orderBy: { timestamp: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.transaction.count(),
	]);

	res.json({
		transactions,
		total,
		page,
		totalPages: Math.ceil(total / pageSize),
	});
});

const getWalletByAddress: RequestHandler = async (req, res) => {
	const address = req.params.address;

	try {
		const wallet = await prisma.wallet.findUnique({
			where: { address },
		});

		if (!wallet) {
			res.status(404).json({ error: "Wallet not found" });
			return;
		}

		res.json(wallet);
	} catch (err) {
		console.error("❌ Error fetching wallet:", err);
		res.status(500).json({ error: "Internal server error" });
	}
};
app.get("/api/wallet/:address", getWalletByAddress);

app.get("/api/wallet/:address/transactions", async (req, res) => {
	const { address } = req.params;

	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				OR: [{ sender: address }, { receiver: address }],
			},
			orderBy: { timestamp: "desc" },
			take: 10,
		});

		res.json(transactions);
	} catch (error) {
		console.error("❌ Failed to fetch wallet transactions:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

const searchHandler: RequestHandler = async (req, res) => {
	const q = req.query.q as string;

	if (!q) {
		res.status(400).json({ error: "Missing query param" });
		return;
	}

	const tx = await prisma.transaction.findFirst({ where: { hash: q } });
	if (tx) {
		res.json({ type: "transaction", data: tx });
		return;
	}

	const wallet = await prisma.wallet.findFirst({ where: { address: q } });
	if (wallet) {
		res.json({ type: "wallet", data: wallet });
		return;
	}

	const blockNum = parseInt(q, 10);
	if (!isNaN(blockNum)) {
		const txs = await prisma.transaction.findMany({
			where: { blockId: blockNum },
			orderBy: { timestamp: "desc" },
		});

		if (txs.length > 0) {
			res.json({
				type: "block",
				data: {
					blockId: blockNum,
					transactions: txs,
				},
			});
			return;
		}
	}

	res.status(404).json({ error: "No results found" });
};
app.get("/api/search", searchHandler);

app.listen(PORT, () => {
	console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
