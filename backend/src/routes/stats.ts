import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

export async function statsEventStream(req: Request, res: Response) {
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
}
