import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function SearchBar() {
	const [query, setQuery] = useState("");
	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!query.trim()) return;
		navigate(`/search?q=${encodeURIComponent(query.trim())}`);
	};

	return (
		<form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
			<input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Search hash / address / block"
				className="px-3 py-2 rounded border w-80 text-black"
			/>
			<button
				type="submit"
				className="px-4 py-2 bg-blue-600 text-white rounded">
				Search
			</button>
		</form>
	);
}
