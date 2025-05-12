import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	{
		path: "wallet/:address",
		file: "routes/wallet.$address.tsx",
	},
] satisfies RouteConfig;
