import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/", (req, res) => {
	res.send("Backend with TypeScript is running! 🚀");
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
