const express = require("express");
const crypto = require("crypto");
const { readLicenses, writeLicenses } = require("../utils/license.utils");

const router = express.Router();

const SECRET = "d9f2A7cE4B1F9eC8D0a6b3E5F2C9A8B7";
const PAYMENT_SECRET = "PAY-7F3C9A2E8D4B6F1C5A9E0D2B8C4F6A";


// 🔐 vérification paiement / admin
function checkPayment(req, res, next) {
  if (req.headers["x-payment-token"] !== PAYMENT_SECRET) {
    return res.status(403).json({ message: "Paiement non autorisé" });
  }
  next();
}

// 🔍 vérifie signature licence
function isValidLicense(key) {
  const parts = key.split("-");
  if (parts.length !== 3) return false;

  const random = parts[1];
  const signature = parts[2];

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(random)
    .digest("hex")
    .substring(0, 16)
    .toUpperCase();

  return signature === expected;
}

/**
 * 🎟️ ATTRIBUTION D’UNE LICENCE (APRES ACHAT)
 * POST /api/license/assign
 * body: { client_id }
 */
router.post("/assign", checkPayment, (req, res) => {
  const { client_id } = req.body;
  if (!client_id) {
    return res.status(400).json({ message: "client_id manquant" });
  }

  const data = readLicenses();
  const license = data.licenses.find(l => !l.active && !l.reserved);

  if (!license) {
    return res.status(404).json({ message: "Plus de licences disponibles" });
  }

  license.reserved = true;
  license.reserved_for = client_id;
  license.reserved_at = new Date().toISOString();

  writeLicenses(data);

  res.json({
    success: true,
    license_key: license.key
  });
});

/**
 * 🔓 ACTIVATION SUR APPAREIL
 * POST /api/license/activate
 * body: { license_key, device_id, client_id }
 */
router.post("/activate", (req, res) => {
  const { license_key, device_id, client_id } = req.body;

  if (!license_key || !device_id || !client_id) {
    return res.status(400).json({ message: "Données manquantes" });
  }

  if (!isValidLicense(license_key)) {
    return res.status(403).json({ message: "Licence falsifiée" });
  }

  const data = readLicenses();
  const license = data.licenses.find(l => l.key === license_key);

  if (!license) {
    return res.status(404).json({ message: "Licence inconnue" });
  }

  if (license.reserved && license.reserved_for !== client_id) {
    return res.status(403).json({ message: "Licence réservée à un autre client" });
  }

  if (license.active) {
    if (license.device_id === device_id) {
      return res.json({ success: true, message: "Licence déjà activée" });
    }
    return res.status(403).json({ message: "Licence déjà utilisée ailleurs" });
  }

  license.active = true;
  license.device_id = device_id;
  license.activated_at = new Date().toISOString();

  writeLicenses(data);

  res.json({ success: true, message: "Licence activée" });
});


router.get("/",  (req, res) => {
  const data = readLicenses();

  const license = data.licenses.find(
    l => !l.active && !l.reserved
  );

  if (!license) {
    return res.status(404).json({
      success: false,
      message: "Aucune licence disponible"
    });
  }

  res.json({
    success: true,
    license_key: license.key
  });
});



module.exports = router;
