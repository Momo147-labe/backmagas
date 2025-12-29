const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const SECRET = "d9f2A7cE4B1F9eC8D0a6b3E5F2C9A8B7";
const COUNT = 50;

const DATA_DIR = path.join(__dirname, "data");
const FILE_PATH = path.join(DATA_DIR, "licenses.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

let existing = [];
if (fs.existsSync(FILE_PATH)) {
  existing = JSON.parse(fs.readFileSync(FILE_PATH)).licenses || [];
}

const existingKeys = new Set(existing.map(l => l.key));

function generateUniqueLicense() {
  while (true) {
    const random = crypto.randomBytes(8).toString("hex").toUpperCase();
    const signature = crypto
      .createHmac("sha256", SECRET)
      .update(random)
      .digest("hex")
      .substring(0, 16)
      .toUpperCase();

    const key = `LIC-${random}-${signature}`;
    if (!existingKeys.has(key)) {
      existingKeys.add(key);
      return key;
    }
  }
}

for (let i = 0; i < COUNT; i++) {
  existing.push({
    key: generateUniqueLicense(),
    active: false,
    reserved: false,
    reserved_for: null,
    reserved_at: null,
    device_id: null,
    activated_at: null
  });
}

fs.writeFileSync(
  FILE_PATH,
  JSON.stringify({ licenses: existing }, null, 2)
);

console.log(`✅ ${COUNT} licences générées`);
