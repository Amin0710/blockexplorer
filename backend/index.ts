import express from "express";
import cors from "cors";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/", (req, res) => {
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
		console.error("Failed to fetch stats:", error);
	}
}

fetchAndStoreStats();
setInterval(fetchAndStoreStats, 60_000); // fetch every 60 seconds

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

	// Send every 60 seconds
	const intervalId = setInterval(sendLatestStats, 60_000);

	// Cleanup when client disconnects
	req.on("close", () => {
		clearInterval(intervalId);
		res.end();
	});
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
