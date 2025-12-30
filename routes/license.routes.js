const express = require("express");
const crypto = require("crypto");
const { readLicenses, writeLicenses } = require("../utils/license.utils");

const router = express.Router();

/* 🔐 SECRETS */
const SECRET = "d9f2A7cE4B1F9eC8D0a6b3E5F2C9A8B7";
const PAYMENT_SECRET = "PAY-7F3C9A2E8D4B6F1C5A9E0D2B8C4F6A";

/* 🔐 Vérification paiement */
function checkPayment(req, res, next) {
  if (req.headers["x-payment-token"] !== PAYMENT_SECRET) {
    return res.status(403).json({
      success: false,
      message: "Paiement non autorisé"
    });
  }
  next();
}

/* 🔍 Vérification cryptographique licence */
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

/* 🎟️ ATTRIBUTION LICENCE (APRÈS PAIEMENT) */
router.post("/assign", checkPayment, (req, res) => {
  const data = readLicenses();

  const license = data.licenses.find(
    l => !l.active && !l.reserved
  );

  if (!license) {
    return res.status(404).json({
      success: false,
      message: "Plus de licences disponibles"
    });
  }

  license.reserved = true;
  license.reserved_at = new Date().toISOString();

  writeLicenses(data);

  res.json({
    success: true,
    license_key: license.key
  });
});

/* 🔓 ACTIVATION SUR APPAREIL */
router.post("/activate", (req, res) => {
  const { license_key, device_id } = req.body;

  /* 🔒 Sécurité */
  if (!license_key) {
    return res.status(400).json({
      success: false,
      message: "Licence manquante"
    });
  }

  if (!device_id) {
    return res.status(400).json({
      success: false,
      message: "Device non identifié"
    });
  }

  /* 🔍 Vérification cryptographique */
  if (!isValidLicense(license_key)) {
    return res.status(403).json({
      success: false,
      message: "Licence falsifiée"
    });
  }

  const data = readLicenses();
  const license = data.licenses.find(l => l.key === license_key);

  if (!license) {
    return res.status(404).json({
      success: false,
      message: "Licence inconnue"
    });
  }

  /* ✅ Déjà activée sur CE PC */
  if (license.active && license.device_id === device_id) {
    return res.json({
      success: true,
      message: "Licence déjà activée"
    });
  }

  /* ❌ Déjà activée ailleurs */
  if (license.active && license.device_id !== device_id) {
    return res.status(403).json({
      success: false,
      message: "Licence déjà utilisée sur un autre appareil"
    });
  }

  /* ✅ Première activation */
  license.active = true;
  license.device_id = device_id;
  license.activated_at = new Date().toISOString();

  writeLicenses(data);

  return res.json({
    success: true,
    message: "Licence activée"
  });
});


module.exports = router;
