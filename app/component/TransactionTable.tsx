import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Transaction } from "../types";
import { fetchTransactions } from "../api/transactions";

export function TransactionTable() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		fetchTransactions(page)
			.then(({ transactions, totalPages }) => {
				setTransactions(transactions);
				setTotalPages(totalPages);
			})
			.catch((err) => console.error(err));
	}, [page]);

	return (
		<div className="mt-10 p-4 sm:p-6 bg-white text-black rounded shadow w-full max-w-7xl mx-auto">
			<h2 className="text-lg sm:text-xl font-bold mb-4">
				📄 Recent Transactions
			</h2>
			<div className="overflow-x-auto">
				<table className="w-full table-auto border-collapse text-xs sm:text-sm">
					<thead>
						<tr className="bg-gray-100 text-left">
							<th className="px-2 py-1 whitespace-nowrap">Hash</th>
							<th className="px-2 py-1 whitespace-nowrap">Value</th>
							<th className="px-2 py-1 whitespace-nowrap">Fee</th>
							<th className="px-2 py-1 whitespace-nowrap">Block</th>
							<th className="px-2 py-1 whitespace-nowrap">Sender</th>
							<th className="px-2 py-1 whitespace-nowrap">Receiver</th>
							<th className="px-2 py-1 whitespace-nowrap">Chain</th>
						</tr>
					</thead>
					<tbody>
						{transactions.map((tx) => (
							<tr key={tx.id} className="border-t">
								<td className="px-2 py-1 text-xs whitespace-nowrap">
									{tx.hash.slice(0, 16)}...
								</td>
								<td className="px-2 py-1 whitespace-nowrap">
									{tx.value.toFixed(8)}{" "}
									{tx.chain === "ethereum" ? "ETH" : "BTC"}
								</td>
								<td className="px-2 py-1 whitespace-nowrap">
									{tx.fee.toFixed(8)} {tx.chain === "ethereum" ? "ETH" : "BTC"}
								</td>
								<td className="px-2 py-1 whitespace-nowrap">
									{tx.blockId ?? "N/A"}
								</td>
								<td className="px-2 py-1 whitespace-nowrap">
									<Link
										to={`/wallet/${tx.sender ?? ""}`}
										className="text-blue-500 underline">
										Sender Wallet Address
									</Link>
								</td>
								<td className="px-2 py-1 whitespace-nowrap">
									<Link
										to={`/wallet/${tx.receiver ?? ""}`}
										className="text-blue-500 underline">
										Receiver Wallet Address
									</Link>
								</td>
								<td className="px-2 py-1 whitespace-nowrap">
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
			</div>

			{/* Pagination */}
			<div className="mt-4 flex items-center justify-between text-xs sm:text-sm">
				<button
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page === 1}
					className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">
					Prev
				</button>
				<span>
					Page {page} of {totalPages}
				</span>
				<button
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					disabled={page === totalPages}
					className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">
					Next
				</button>
			</div>
		</div>
	);
}
