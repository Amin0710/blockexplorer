import type { ReactNode } from "react";
import { SearchBar } from "./SearchBar";
import { Link } from "react-router-dom";

interface Props {
	children: ReactNode;
}

export function PageContainer({ children }: Props) {
	return (
		<div className="min-h-screen bg-slate-900 text-white p-6">
			<div className="flex justify-center items-center p-6 bg-white text-black rounded shadow w-full max-w-7xl mx-auto">
				<div>
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Link
								to="/"
								className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800">
								🏠 <span>Home</span>
							</Link>
						</div>
						<SearchBar />
					</div>
					{children}
				</div>
			</div>
		</div>
	);
}
