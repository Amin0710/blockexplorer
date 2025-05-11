import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Block Explorer" },
		{ name: "description", content: "Explore the blockchain!" },
	];
}

export default function Home() {
	return (
		<div className="min-h-screen p-8">
			<h1 className="text-4xl font-bold mb-4">Welcome to Block Explorer</h1>
			<p className="text-lg text-slate-600 dark:text-slate-300">
				Start exploring the blockchain!
			</p>
		</div>
	);
}
