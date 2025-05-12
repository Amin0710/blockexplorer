import { describe, it, expect, vi, beforeEach } from "vitest";
import { loader } from "../pages/Wallet";
import * as walletAPI from "../api/wallet";
import type { Wallet, Transaction } from "../types";

vi.mock("../api/wallet");

beforeEach(() => {
	vi.clearAllMocks();
});

describe("wallet loader", () => {
	it("returns wallet and transactions on success", async () => {
		const mockWallet: Wallet = {
			address: "0x8c8d7c46219d9205f056f28fee5950ad564d7465",
			balance: -2.692833278334938,
			txCount: 12,
			firstSeen: "2024-01-01T00:00:00Z",
			lastSeen: "2024-04-01T00:00:00Z",
		};

		const mockTxs: Transaction[] = [
			{
				id: 1,
				hash: "0x02adfc9a106aa58407f6b3f3922482c65dbcfb48d639a7c89c86255a4193e8c4",
				blockId: 567890,
				timestamp: "2024-04-02T14:30:00Z",
				value: 0.2377467514970912,
				fee: 0.00002675543241,
				sender: "0x8c8d7c46219d9205f056f28fee5950ad564d7465",
				receiver: "0x55ba00116b0d889d0697579ef2da4a6c4409296c",
				chain: "ethereum",
			},
			{
				id: 2,
				hash: "0x82511cd08d46226000134b423666c219be8d978ca76ea52aa03a0b1603377c90",
				blockId: null,
				timestamp: "2024-04-02T15:45:00Z",
				value: 0.5678696366105868,
				fee: 0.00002675543241,
				sender: "0x8c8d7c46219d9205f056f28fee5950ad564d7465",
				receiver: "0x50e76044c20dd90dc45cb1198060c2bddb859ed7",
				chain: "ethereum",
			},
		];

		vi.spyOn(walletAPI, "fetchWallet").mockResolvedValue(mockWallet);
		vi.spyOn(walletAPI, "fetchWalletTransactions").mockResolvedValue(mockTxs);

		const result = await loader({
			params: { address: "abc123" },
			request: new Request("http://localhost"),
			context: {},
		});

		expect(result.wallet).toEqual(mockWallet);
		expect(result.transactions).toEqual(mockTxs);
	});

	it("throws if address param is missing", async () => {
		await expect(
			loader({
				params: {},
				request: new Request("http://localhost"),
				context: {},
			})
		).rejects.toThrow("Missing address param");
	});
});
