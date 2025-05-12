import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchAndUpdateEthereumData() {
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
