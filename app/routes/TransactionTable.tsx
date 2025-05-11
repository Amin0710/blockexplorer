import { useEffect, useState } from "react";

type Transaction = {
	id: number;
	hash: string;
	blockId: number | null;
	timestamp: string;
	value: number;
	fee: number;
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
						<th className="px-2 py-1">Value (BTC)</th>
						<th className="px-2 py-1">Fee (BTC)</th>
						<th className="px-2 py-1">Block</th>
					</tr>
				</thead>
				<tbody>
					{transactions.map((tx) => (
						<tr key={tx.id} className="border-t">
							<td className="px-2 py-1 text-xs">{tx.hash.slice(0, 16)}...</td>
							<td className="px-2 py-1">{tx.value.toFixed(8)}</td>
							<td className="px-2 py-1">{tx.fee.toFixed(8)}</td>
							<td className="px-2 py-1">{tx.blockId ?? "N/A"}</td>
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
