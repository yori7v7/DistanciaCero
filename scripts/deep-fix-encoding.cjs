const fs = require("fs");
const path = require("path");

const root = path.join(process.cwd(), "src");
const exts = new Set([".jsx", ".js", ".json", ".css", ".html", ".md"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full, files);
    } else if (exts.has(path.extname(full))) {
      files.push(full);
    }
  }

  return files;
}

const replacements = [
  // Triple/doble mojibake muy roto
  ["ÃƒÆ’Ã‚Â¡", "á"],
  ["ÃƒÆ’Ã‚Â©", "é"],
  ["ÃƒÆ’Ã‚Â­", "í"],
  ["ÃƒÆ’Ã‚Â³", "ó"],
  ["ÃƒÆ’Ã‚Âº", "ú"],
  ["ÃƒÆ’Ã‚Â±", "ñ"],
  ["ÃƒÆ’Ã‚Â", "Á"],
  ["ÃƒÆ’Ã‚Â‰", "É"],
  ["ÃƒÆ’Ã‚Â", "Í"],
  ["ÃƒÆ’Ã‚Â“", "Ó"],
  ["ÃƒÆ’Ã‚Âš", "Ú"],
  ["ÃƒÆ’Ã‚Â‘", "Ñ"],

  // Doble mojibake con Â
  ["ÃƒÂ¡", "á"],
  ["ÃƒÂ©", "é"],
  ["ÃƒÂ­", "í"],
  ["ÃƒÂ³", "ó"],
  ["ÃƒÂº", "ú"],
  ["ÃƒÂ±", "ñ"],
  ["ÃƒÂ", "Á"],
  ["ÃƒÂ‰", "É"],
  ["ÃƒÂ", "Í"],
  ["ÃƒÂ“", "Ó"],
  ["ÃƒÂš", "Ú"],
  ["ÃƒÂ‘", "Ñ"],

  // Doble mojibake sin Â
  ["Ãƒ¡", "á"],
  ["Ãƒ©", "é"],
  ["Ãƒ­", "í"],
  ["Ãƒ³", "ó"],
  ["Ãƒº", "ú"],
  ["Ãƒ±", "ñ"],
  ["Ãƒ", "Á"],
  ["Ãƒ‰", "É"],
  ["Ãƒ", "Í"],
  ["Ãƒ“", "Ó"],
  ["Ãƒš", "Ú"],
  ["Ãƒ‘", "Ñ"],

  // Mojibake normal
  ["Ã¡", "á"],
  ["Ã©", "é"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ãº", "ú"],
  ["Ã±", "ñ"],
  ["Ã", "Á"],
  ["Ã‰", "É"],
  ["Ã", "Í"],
  ["Ã“", "Ó"],
  ["Ãš", "Ú"],
  ["Ã‘", "Ñ"],

  // Signos
  ["Â¿", "¿"],
  ["Â¡", "¡"],
  ["Â«", "«"],
  ["Â»", "»"],
  ["Â°", "°"],

  // Comillas raras comunes
  ["â€œ", "“"],
  ["â€", "”"],
  ["â€˜", "‘"],
  ["â€™", "’"],
  ["â€“", "–"],
  ["â€”", "—"],
  ["â€¦", "…"]
];

function fixUnicodeEscapes(text) {
  return text
    .replace(/\\\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function fixText(text) {
  let fixed = fixUnicodeEscapes(text);

  let previous = "";
  while (previous !== fixed) {
    previous = fixed;
    for (const [bad, good] of replacements) {
      fixed = fixed.split(bad).join(good);
    }
  }

  return fixed;
}

let changed = 0;

for (const file of walk(root)) {
  const original = fs.readFileSync(file, "utf8");
  const fixed = fixText(original);

  if (fixed !== original) {
    fs.writeFileSync(file, fixed, "utf8");
    changed++;
    console.log("Corregido:", path.relative(process.cwd(), file));
  }
}

console.log(`\nListo. Archivos corregidos: ${changed}`);
