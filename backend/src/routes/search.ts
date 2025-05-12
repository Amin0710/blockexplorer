import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "express";

const prisma = new PrismaClient();

export const searchHandler: RequestHandler = async (req, res) => {
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
