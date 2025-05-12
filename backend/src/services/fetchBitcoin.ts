import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchAndUpdateBitcoinData() {
	const apiUrl = process.env.BLOCKCHAIR_API_URL;
	if (!apiUrl) throw new Error("Missing Blockchair API URL");

	try {
		const response = await axios.get(
			`${apiUrl}/bitcoin/transactions?q=is_coinbase(false)&limit=10`
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
