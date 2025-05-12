import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "express";

const prisma = new PrismaClient();

export const getWalletByAddress: RequestHandler = async (req, res) => {
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

export const getWalletTransactions: RequestHandler = async (req, res) => {
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
};
