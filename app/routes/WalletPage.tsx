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

	useEffect(() => {
		fetch(`http://localhost:3001/api/wallet/${address}`)
			.then((res) => {
				if (!res.ok) throw new Error("Wallet not found");
				return res.json();
			})
			.then(setWallet)
			.catch((err) => setError(err.message));
	}, [address]);

	if (error) return <p className="text-red-600">{error}</p>;
	if (!wallet) return <p>Loading wallet...</p>;

	return (
		<div className="p-6 max-w-xl mx-auto bg-white rounded shadow mt-10 space-y-2">
			<h2 className="text-xl font-bold">🔍 Wallet Details</h2>
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
		</div>
	);
}
