import type { LoaderFunctionArgs } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import { PageContainer } from "../component/PageContainer";
import { Spinner } from "../component/Spinner";
import { fetchWallet, fetchWalletTransactions } from "../api/wallet";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const address = params.address;
	if (!address) throw new Error("Missing address param");

	const [wallet, transactions] = await Promise.all([
		fetchWallet(address),
		fetchWalletTransactions(address),
	]);

	return { wallet, transactions };
};

export function ErrorBoundary({ error }: { error: Error }) {
	return (
		<PageContainer>
			<p className="text-red-600 font-semibold">❌ {error.message}</p>
		</PageContainer>
	);
}

export default function Wallet() {
	const { wallet, transactions } = useLoaderData() as {
		wallet: any;
		transactions: any[];
	};

	if (!wallet) return <Spinner />;

	return (
		<PageContainer>
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
							<strong>Chain:</strong>
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
		</PageContainer>
	);
}
