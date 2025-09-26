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
    // Roblox API expects POST with array of items
    const response = await fetch("https://catalog.roblox.com/v1/catalog/items/details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            itemType: "Asset",
            id: parseInt(assetId, 10),
          },
        ],
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch Roblox API");

    const data = await response.json();
    if (!data.data || !data.data[0]) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = data.data[0];
    const itemInfo = {
      id: item.id,
      name: item.name,
      price: item.price || "N/A",
      isLimited: item.collectibleItemId !== null,
      remaining: item.unitsAvailableForConsumption || null,
    };

    res.json(itemInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy running on port ${PORT}`);
});
