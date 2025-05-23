import { useEffect, useState } from "react";
import { TransactionTable } from "../component/TransactionTable";
import { SearchBar } from "../component/SearchBar";
import type { Stats } from "../types";
import { subscribeToStats } from "../api/stats";
import { Spinner } from "../component/Spinner";

export function meta() {
	return [
		{ title: "Block Explorer" },
		{ name: "description", content: "Explore the blockchain!" },
	];
}

export default function Home() {
	const [stats, setStats] = useState<Stats | null>(null);

	useEffect(() => {
		const source = subscribeToStats(setStats);
		return () => source.close();
	}, []);

	if (!stats) return <Spinner />;

	return (
		<div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6">
			<div className="flex justify-center">
				<div className="p-4 sm:p-6 bg-white text-black rounded shadow w-full max-w-md space-y-2">
					<SearchBar />
					<h2 className="text-lg sm:text-xl font-semibold">
						📊 Live Blockchain Stats
					</h2>
					<p className="text-sm sm:text-base">
						<strong>Hashrate:</strong>{" "}
						{stats.hashRate != null
							? (Number(stats.hashRate) / 1e18).toFixed(2) + " EH/s"
							: "N/A"}
					</p>
					<p className="text-sm sm:text-base">
						<strong>Mempool TX Count:</strong> {stats.mempoolTxCount ?? "N/A"}
					</p>
					<p className="text-sm sm:text-base">
						<strong>Market Cap (USD):</strong>{" "}
						{stats.marketCapUsd != null
							? `$${stats.marketCapUsd.toLocaleString()}`
							: "N/A"}
					</p>
					<p className="text-xs sm:text-sm text-gray-500">
						Updated: {new Date(stats.createdAt).toLocaleTimeString()}
					</p>
				</div>
			</div>

			<TransactionTable />
		</div>
	);
}
