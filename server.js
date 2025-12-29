const express = require("express");
const cors = require("cors");

const licenseRoutes = require("./routes/license.routes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/license", licenseRoutes);

app.listen(PORT, () => {
  console.log(`🔐 Serveur licence actif sur http://localhost:${PORT}`);
});
