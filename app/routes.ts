import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
	index("pages/Home.tsx"),
	{
		path: "wallet/:address",
		file: "pages/Wallet.tsx",
	},
	{
		path: "search",
		file: "pages/SearchResults.tsx",
	},
] satisfies RouteConfig;
