export async function fetchSearchResult(query: string) {
	const res = await fetch(`http://localhost:3001/api/search?q=${query}`);
	if (!res.ok) throw new Error("Failed to fetch search result");
	const data = await res.json();
	if (data.error) throw new Error(data.error);
	return data;
}
