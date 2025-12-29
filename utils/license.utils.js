const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "../data/licenses.json");

function readLicenses() {
  return JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
}

function writeLicenses(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  readLicenses,
  writeLicenses
};
