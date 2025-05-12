import express from "express";
import cors from "cors";
import { getWalletByAddress, getWalletTransactions } from "./routes/wallet";
import { statsEventStream } from "./routes/stats";
import { getTransactions } from "./routes/transactions";
import { searchHandler } from "./routes/search";
import { fetchAndStoreStats } from "./services/fetchStats";
import { fetchAndUpdateBitcoinData } from "./services/fetchBitcoin";
import { fetchAndUpdateEthereumData } from "./services/fetchEthereum";

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/", (_req, res) => {
	res.send("Backend with TypeScript is running! 🚀");
});

app.get("/events/stats", statsEventStream);
app.get("/api/transactions", getTransactions);
app.get("/api/wallet/:address", getWalletByAddress);
app.get("/api/wallet/:address/transactions", getWalletTransactions);
app.get("/api/search", searchHandler);

fetchAndStoreStats();
fetchAndUpdateBitcoinData();
fetchAndUpdateEthereumData();

setInterval(fetchAndStoreStats, 60_000);
setInterval(fetchAndUpdateBitcoinData, 60_000);
setInterval(fetchAndUpdateEthereumData, 60_000);

app.listen(PORT, () => {
	console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
