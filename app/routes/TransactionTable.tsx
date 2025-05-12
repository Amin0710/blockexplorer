import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Transaction = {
	id: number;
	hash: string;
	blockId: number | null;
	timestamp: string;
	value: number;
	fee: number;
	sender?: string;
	receiver?: string;
	chain: "bitcoin" | "ethereum";
};

export function TransactionTable() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		fetch(`http://localhost:3001/api/transactions?page=${page}`)
			.then((res) => res.json())
			.then((data) => {
				setTransactions(data.transactions);
				setTotalPages(data.totalPages);
			});
	}, [page]);

	return (
		<div className="mt-10 p-6 bg-white text-black rounded shadow w-full max-w-4xl mx-auto">
			<h2 className="text-xl font-bold mb-4">📄 Recent Transactions</h2>
			<table className="w-full table-auto border-collapse text-sm">
				<thead>
					<tr className="bg-gray-100 text-left">
						<th className="px-2 py-1">Hash</th>
						<th className="px-2 py-1">Value</th>
						<th className="px-2 py-1">Fee</th>
						<th className="px-2 py-1">Block</th>
						<th className="px-2 py-1">Sender</th>
						<th className="px-2 py-1">Receiver</th>
						<th className="px-2 py-1">Chain</th>
					</tr>
				</thead>
				<tbody>
					{transactions.map((tx) => (
						<tr key={tx.id} className="border-t">
							<td className="px-2 py-1 text-xs">{tx.hash.slice(0, 16)}...</td>
							<td className="px-2 py-1">
								{tx.value.toFixed(8)} {tx.chain === "ethereum" ? "ETH" : "BTC"}
							</td>
							<td className="px-2 py-1">
								{tx.fee.toFixed(8)} {tx.chain === "ethereum" ? "ETH" : "BTC"}
							</td>
							<td className="px-2 py-1">{tx.blockId ?? "N/A"}</td>
							<td>
								<Link
									to={`/wallet/${tx.sender}`}
									className="text-blue-500 underline">
									{tx.sender}
								</Link>
							</td>
							<td>
								<Link
									to={`/wallet/${tx.receiver}`}
									className="text-blue-500 underline">
									{tx.receiver}
								</Link>
							</td>
							<td className="px-2 py-1">
								<span
									className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
										tx.chain === "ethereum"
											? "bg-purple-200 text-purple-800"
											: "bg-yellow-200 text-yellow-800"
									}`}>
									{tx.chain.toUpperCase()}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Pagination */}
			<div className="mt-4 flex items-center justify-between">
				<button
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page === 1}
					className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">
					Prev
				</button>
				<span className="text-sm">
					Page {page} of {totalPages}
				</span>
				<button
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					disabled={page === totalPages}
					className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">
					Next
				</button>
			</div>
		</div>
	);
}
