import express from "express";
import cors from "cors";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

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

async function fetchAndStoreTransactions() {
	try {
		const response = await axios.get(
			"https://api.blockchair.com/bitcoin/transactions?q=is_coinbase(false)&limit=10"
		);

		const transactions = response.data?.data;
		if (!transactions || !Array.isArray(transactions)) return;

		for (const tx of transactions) {
			await prisma.transaction.upsert({
				where: { hash: tx.hash },
				update: {},
				create: {
					hash: tx.hash,
					chain: "bitcoin",
					blockId: tx.block_id,
					timestamp: new Date(tx.time),
					value: tx.output_total / 1e8, // Satoshi → BTC
					fee: tx.fee / 1e8,
					sender: "unknown",
					receiver: "unknown",
				},
			});
		}

		console.log(`[✅] Synced ${transactions.length} transactions`);
	} catch (error) {
		console.error("❌ Failed to fetch transactions:", error);
	}
}

// Initial fetch
fetchAndStoreStats();
fetchAndStoreTransactions();

// Auto-refresh every 60 seconds
setInterval(fetchAndStoreStats, 60_000);
setInterval(fetchAndStoreTransactions, 60_000);

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

app.listen(PORT, () => {
	console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
