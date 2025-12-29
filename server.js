const express = require("express");
const cors = require("cors");
const https = require("https");
const licenseRoutes = require("./routes/license.routes");

const app = express();

// ✅ IMPORTANT pour Render
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/license", licenseRoutes);

// 🔗 URL Render du backend
const BACKEND_URL = "https://magasinlicence.onrender.com";

// 🔁 Fonction de ping
function pingServer() {
  https
    .get(BACKEND_URL, (res) => {
      console.log(`[PING] Serveur réveillé - Status: ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error("[PING] Erreur:", err.message);
    });
}

app.get("/", (req, res) => {
  res.send("Backend licence actif 🚀");
});

app.listen(PORT, () => {
  console.log(`🔐 Serveur licence actif sur le port ${PORT}`);

  // 🟢 Ping immédiat au démarrage
  pingServer();

  // ⏱️ Ping toutes les 10 minutes (600 000 ms)
  setInterval(() => {
    console.log("[INTERVAL] Ping automatique...");
    pingServer();
  }, 10 * 60 * 1000);
});
