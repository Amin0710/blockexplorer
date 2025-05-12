import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Transaction } from "../types";
import { fetchSearchResult } from "../api/search";
import { PageContainer } from "../component/PageContainer";
import { Spinner } from "../component/Spinner";

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

	if (error) {
		return (
			<PageContainer>
				<p className="text-red-600">{error}</p>
			</PageContainer>
		);
	}

	if (!result) return <Spinner />;

	return (
		<PageContainer>
			{result?.type === "transaction" && (
				<>
					<h2 className="text-xl font-semibold">🔍 Transaction Found</h2>
					<p>
						<strong>Hash:</strong> {result.data.hash}
					</p>
					<p>
						<strong>Chain:</strong> {result.data.chain}
					</p>
					<p>
						<strong>From:</strong> {result.data.sender}
					</p>
					<p>
						<strong>To:</strong> {result.data.receiver}
					</p>
				</>
			)}

			{result?.type === "wallet" && (
				<>
					<h2 className="text-xl font-semibold">👛 Wallet Found</h2>
					<Link
						to={`/wallet/${result.data.address}`}
						className="underline text-blue-600">
						View Wallet Details
					</Link>
				</>
			)}

			{result?.type === "block" && (
				<>
					<h2 className="text-xl font-semibold">🧱 Block Found</h2>
					<h3 className="text-lg mt-4 mb-2">Transactions</h3>
					{result.data.transactions.length ? (
						<ul className="list-disc list-inside space-y-1">
							{result.data.transactions.map((tx: Transaction) => (
								<li key={tx.hash}>
									<Link
										to={`/search?q=${tx.hash}`}
										className="text-blue-500 underline text-sm">
										{tx.hash}
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p className="text-gray-500">
							No transactions found in this block.
						</p>
					)}
				</>
			)}

			{!["transaction", "wallet", "block"].includes(result?.type) && (
				<p>No result found.</p>
			)}
		</PageContainer>
	);
}
