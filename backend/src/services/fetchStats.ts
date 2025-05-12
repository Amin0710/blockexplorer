import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchAndStoreStats() {
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
