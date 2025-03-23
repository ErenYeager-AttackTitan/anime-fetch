const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// API route
app.get("/anime", async (req, res) => {
    const { id, s, ep } = req.query;

    if (!id || !s || !ep) {
        return res.status(400).json({ error: "Missing required parameters: ?id= & ?s= & ?ep=" });
    }

    const url = `https://anime-api.ct.ws/anime/${id}/${s}/${ep}?m`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.servers && Array.isArray(data.servers)) {
            res.json({
                animeId: id,
                season: s,
                episode: ep,
                servers: data.servers.map(server => ({
                    name: server.name,
                    url: server.url,
                })),
            });
        } else {
            res.json({ message: "No servers found", animeId: id, season: s, episode: ep });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch anime data", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
              
