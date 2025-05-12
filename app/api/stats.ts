import type { Stats } from "../types";

export function subscribeToStats(callback: (data: Stats) => void): EventSource {
	const source = new EventSource("http://localhost:3001/events/stats");

	source.onmessage = (event) => {
		const data: Stats = JSON.parse(event.data);
		callback(data);
	};

	return source; // Call `.close()` on unmount
}
