import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("✅ Roblox UGC Proxy Running"));

app.get("/ugc/:assetId", async (req, res) => {
  const { assetId } = req.params;
  if (!assetId || isNaN(assetId)) return res.status(400).json({ error: "Invalid assetId" });

  try {
    const robloxRes = await fetch("https://catalog.roblox.com/v1/catalog/items/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ itemType: "Asset", id: parseInt(assetId, 10) }] }),
    });

    if (!robloxRes.ok) throw new Error(`Roblox API error ${robloxRes.status}`);

    const json = await robloxRes.json();
    const item = json.data?.[0];

    if (!item) return res.status(404).json({ error: "Item not found" });

    res.json({
      id: item.id ?? assetId,
      name: item.name ?? "Unknown",
      price: item.price ?? "N/A",
      isLimited: Boolean(item.collectibleItemId),
      remaining: item.unitsAvailableForConsumption ?? null,
    });
  } catch (err) {
    console.error("Proxy fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
