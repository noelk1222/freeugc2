import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("✅ Roblox UGC Proxy Running"));

app.get("/ugc/:assetId", async (req, res) => {
  const { assetId } = req.params;
  if (!assetId || isNaN(assetId)) return res.status(400).json({ error: "Invalid assetId" });

  try {
    // 1️⃣ Get catalog details
    const catalogRes = await fetch("https://catalog.roblox.com/v1/catalog/items/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ itemType: "Asset", id: parseInt(assetId, 10) }] }),
    });

    if (!catalogRes.ok) throw new Error(`Catalog API returned ${catalogRes.status}`);
    const catalogJson = await catalogRes.json();
    const item = catalogJson.data?.[0];
    if (!item) return res.status(404).json({ error: "Item not found" });

    // 2️⃣ Optionally fetch the game name if SoldIn is required
    let soldInName = null;
    if (item.sellingUniverseId) {
      const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${item.sellingUniverseId}`);
      if (gameRes.ok) {
        const gameJson = await gameRes.json();
        const universe = gameJson.data?.[0];
        soldInName = universe?.name ?? null;
      }
    }

    // 3️⃣ Construct full UGC info
    const ugcInfo = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price ?? "Free",
      quantityLeft: item.unitsAvailableForConsumption ?? null,
      maxPerUser: item.maximumAllowedPerUser ?? null,
      soldIn: soldInName,
      tradable: Boolean(item.isLimited && item.collectibleItemId),
      holdingPeriod: Boolean(item.hasResaleRestriction),
      type: item.assetType?.name ?? null,
      materials: item.assetType?.materials ?? null,
      created: item.created,
    };

    res.json(ugcInfo);
  } catch (err) {
    console.error("Proxy fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
