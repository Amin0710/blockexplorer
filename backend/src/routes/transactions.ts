import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "express";

const prisma = new PrismaClient();

export const getTransactions: RequestHandler = async (req, res) => {
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
};
