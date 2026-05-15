const fs = require("fs");
const path = require("path");

const root = path.join(process.cwd(), "src");
const extensions = new Set([".jsx", ".js", ".json", ".css", ".html", ".md"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full, files);
    } else if (extensions.has(path.extname(full))) {
      files.push(full);
    }
  }

  return files;
}

function c(...codes) {
  return String.fromCharCode(...codes);
}

const replacements = [
  // Doble mojibake: ÃƒÂ¡, ÃƒÂ©, etc.
  [c(0x00c3, 0x0192, 0x00c2, 0x00a1), "á"],
  [c(0x00c3, 0x0192, 0x00c2, 0x00a9), "é"],
  [c(0x00c3, 0x0192, 0x00c2, 0x00ad), "í"],
  [c(0x00c3, 0x0192, 0x00c2, 0x00b3), "ó"],
  [c(0x00c3, 0x0192, 0x00c2, 0x00ba), "ú"],
  [c(0x00c3, 0x0192, 0x00c2, 0x00b1), "ñ"],
  [c(0x00c3, 0x0192, 0x00c2, 0x0081), "Á"],
  [c(0x00c3, 0x0192, 0x00c2, 0x0089), "É"],
  [c(0x00c3, 0x0192, 0x00c2, 0x008d), "Í"],
  [c(0x00c3, 0x0192, 0x00c2, 0x0093), "Ó"],
  [c(0x00c3, 0x0192, 0x00c2, 0x009a), "Ú"],
  [c(0x00c3, 0x0192, 0x00c2, 0x0091), "Ñ"],

  // Mojibake normal: Ã¡, Ã©, etc.
  [c(0x00c3, 0x00a1), "á"],
  [c(0x00c3, 0x00a9), "é"],
  [c(0x00c3, 0x00ad), "í"],
  [c(0x00c3, 0x00b3), "ó"],
  [c(0x00c3, 0x00ba), "ú"],
  [c(0x00c3, 0x00b1), "ñ"],
  [c(0x00c3, 0x0081), "Á"],
  [c(0x00c3, 0x0089), "É"],
  [c(0x00c3, 0x008d), "Í"],
  [c(0x00c3, 0x0093), "Ó"],
  [c(0x00c3, 0x009a), "Ú"],
  [c(0x00c3, 0x0091), "Ñ"],

  // Signos raros comunes
  [c(0x00c2, 0x00bf), "¿"],
  [c(0x00c2, 0x00a1), "¡"],
  [c(0x00e2, 0x20ac, 0x0153), "“"],
  [c(0x00e2, 0x20ac, 0x009d), "”"],
  [c(0x00e2, 0x20ac, 0x2122), "’"],
  [c(0x00e2, 0x20ac, 0x201c), "—"]
];

function fixText(content) {
  let fixed = content;

  // Decodificar literales tipo \u00ed
  fixed = fixed.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );

  fixed = fixed.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  // Reemplazar mojibake varias veces por si está doblemente roto
  let previous = "";
  while (previous !== fixed) {
    previous = fixed;

    for (const [bad, good] of replacements) {
      fixed = fixed.split(bad).join(good);
    }
  }

  return fixed;
}

const files = walk(root);
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const fixed = fixText(original);

  if (fixed !== original) {
    fs.writeFileSync(file, fixed, "utf8");
    changed++;
    console.log("Corregido:", path.relative(process.cwd(), file));
  }
}

console.log(`\nListo. Archivos corregidos: ${changed}`);
