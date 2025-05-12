import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

type Wallet = {
	address: string;
	balance: number | null;
	txCount: number | null;
	firstSeen: string | null;
	lastSeen: string | null;
};

export default function WalletPage() {
	const { address } = useParams<{ address: string }>();
	const [wallet, setWallet] = useState<Wallet | null>(null);
	const [error, setError] = useState("");
	const [transactions, setTransactions] = useState<any[]>([]);

	useEffect(() => {
		fetch(`http://localhost:3001/api/wallet/${address}`)
			.then((res) => {
				if (!res.ok) throw new Error("Wallet not found");
				return res.json();
			})
			.then(setWallet)
			.catch((err) => setError(err.message));
	}, [address]);

	useEffect(() => {
		if (!address) return;
		fetch(`http://localhost:3001/api/wallet/${address}/transactions`)
			.then((res) => res.json())
			.then(setTransactions)
			.catch(console.error);
	}, [address]);

	if (error) return <p className="text-red-600">{error}</p>;
	if (!wallet) return <p>Loading wallet...</p>;

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
			<div className="p-6 bg-white text-black rounded shadow w-full max-w-md space-y-2">
				<h2 className="text-xl font-semibold">🔍 Wallet Details</h2>
				<p>
					<strong>Recent TXs Shown:</strong> {transactions.length}
				</p>
				<p>
					<strong>Address:</strong> {wallet.address}
				</p>
				<p>
					<strong>Balance:</strong> {wallet.balance ?? "N/A"} BTC
				</p>
				<p>
					<strong>TX Count:</strong> {wallet.txCount ?? "N/A"}
				</p>
				<p>
					<strong>First Seen:</strong> {wallet.firstSeen ?? "N/A"}
				</p>
				<p>
					<strong>Last Seen:</strong> {wallet.lastSeen ?? "N/A"}
				</p>
				<h3 className="text-lg font-semibold mt-6">🧾 Recent Transactions</h3>
				<ul className="space-y-2">
					{transactions.map((tx) => (
						<li key={tx.hash} className="text-sm border p-2 rounded">
							<div>
								<strong>Hash:</strong> {tx.hash}
							</div>
							<div>
								<strong>Chain:</strong>{" "}
								<span
									className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
										tx.chain === "ethereum"
											? "bg-purple-200 text-purple-800"
											: "bg-yellow-200 text-yellow-800"
									}`}>
									{tx.chain.toUpperCase()}
								</span>
							</div>
							<div>
								<strong>Value:</strong> {tx.value}{" "}
								{tx.chain === "ethereum" ? "ETH" : "BTC"}
							</div>
							<div>
								<strong>Fee:</strong> {tx.fee}{" "}
								{tx.chain === "ethereum" ? "ETH" : "BTC"}
							</div>
							<div>
								<strong>Time:</strong> {new Date(tx.timestamp).toLocaleString()}
							</div>
							<div>
								<strong>From:</strong> {tx.sender}
							</div>
							<div>
								<strong>To:</strong> {tx.receiver}
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
