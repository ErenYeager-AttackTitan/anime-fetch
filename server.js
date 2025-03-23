const express = require("express");
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const cheerio = require("cheerio"); // For scraping
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Ignore SSL certificate issues
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

app.get("/anime", async (req, res) => {
    const { id, s, ep } = req.query;

    if (!id || !s || !ep) {
        return res.status(400).json({ error: "Missing required parameters: ?id= & ?s= & ?ep=" });
    }

    const url = `https://anime-api.ct.ws/anime/${id}/${s}/${ep}?m`;

    try {
        const response = await axios.get(url, { httpsAgent });
        const html = response.data;

        // Load HTML into cheerio
        const $ = cheerio.load(html);

        // Extract video iframe URL
        const iframeSrc = $("#videoFrame").attr("src") || null;

        // Extract available servers
        const servers = [];
        $(".modal-option").each((_, el) => {
            const serverName = $(el).text().trim();
            const serverUrl = $(el).attr("data-link");
            if (serverName && serverUrl) {
                servers.push({ name: serverName, url: serverUrl });
            }
        });

        res.json({
            animeId: id,
            season: s,
            episode: ep,
            iframeUrl: iframeSrc,
            servers
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch anime data", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
