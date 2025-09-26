import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Health check
app.get("/", (req, res) => {
  res.send("✅ Roblox UGC Proxy Running");
});

// Proxy endpoint: fetch UGC info
app.get("/ugc/:assetId", async (req, res) => {
  const { assetId } = req.params;

  try {
    const response = await fetch(
      `https://catalog.roblox.com/v1/catalog/items/${assetId}/details`
    );
    if (!response.ok) throw new Error("Failed to fetch Roblox API");

    const data = await response.json();

    res.json({
      id: assetId,
      name: data.Name || "Unknown",
      price: data.PriceInRobux || "N/A",
      isLimited: data.IsLimited || data.IsLimitedUnique || false,
      remaining: data.Remaining || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy running on port ${PORT}`);
});
