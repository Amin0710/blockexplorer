import { useEffect, useState } from "react";
import { TransactionTable } from "../component/TransactionTable";
import { SearchBar } from "../component/SearchBar";
import type { Stats } from "../types";
import { subscribeToStats } from "../api/stats";

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

	if (!stats) return <p>Loading stats...</p>;

	return (
		<div className="min-h-screen bg-slate-900 text-white p-6">
			<div className="flex justify-center">
				<div className="p-6 bg-white text-black rounded shadow w-full max-w-md space-y-2">
					<SearchBar />
					<h2 className="text-xl font-semibold">📊 Live Blockchain Stats</h2>
					<p>
						<strong>Hashrate:</strong>{" "}
						{stats.hashRate != null
							? (Number(stats.hashRate) / 1e18).toFixed(2) + " EH/s"
							: "N/A"}
					</p>
					<p>
						<strong>Mempool TX Count:</strong> {stats.mempoolTxCount ?? "N/A"}
					</p>
					<p>
						<strong>Market Cap (USD):</strong>{" "}
						{stats.marketCapUsd != null
							? `$${stats.marketCapUsd.toLocaleString()}`
							: "N/A"}
					</p>
					<p className="text-sm text-gray-500">
						Updated: {new Date(stats.createdAt).toLocaleTimeString()}
					</p>
				</div>
			</div>

			<TransactionTable />
		</div>
	);
}
