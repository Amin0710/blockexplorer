import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Transaction } from "../types";
import { fetchSearchResult } from "../api/search";

export default function SearchResults() {
	const [params] = useSearchParams();
	const query = params.get("q") ?? "";
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!query) return;
		fetchSearchResult(query)
			.then(setResult)
			.catch((err) => setError(err.message));
	}, [query]);

	if (error) return <p className="text-red-600">{error}</p>;
	if (!result) return <p>Searching for: {query}</p>;

	if (result.type === "transaction") {
		const tx = result.data;

		return (
			<div className="p-4">
				<h2 className="text-xl">Transaction Found</h2>
				<p>
					<strong>Hash:</strong> {tx.hash}
				</p>
				<p>
					<strong>Chain:</strong> {tx.chain}
				</p>
				<p>
					<strong>From:</strong> {tx.sender}
				</p>
				<p>
					<strong>To:</strong> {tx.receiver}
				</p>
			</div>
		);
	}

	if (result.type === "wallet") {
		return (
			<div className="p-4">
				<h2 className="text-xl">Wallet Found</h2>
				<Link
					to={`/wallet/${result.data.address}`}
					className="underline text-blue-600">
					View Wallet Details
				</Link>
			</div>
		);
	}

	if (result.type === "block") {
		const blockData = result.data as {
			blockId: number;
			transactions: Transaction[];
		};
		const transactions = blockData.transactions;

		return (
			<div className="p-4">
				<h2 className="text-xl">Block Found</h2>
				<h3 className="text-lg mt-4 mb-2">Transactions</h3>
				{transactions.length ? (
					<ul className="list-disc list-inside space-y-1">
						{transactions.map((tx) => (
							<li key={tx.hash}>
								<a
									href={`/search?q=${tx.hash}`}
									className="text-blue-500 underline text-sm">
									{tx.hash}
								</a>
							</li>
						))}
					</ul>
				) : (
					<p className="text-gray-500">No transactions found in this block.</p>
				)}
			</div>
		);
	}

	return <p>No result found.</p>;
}
