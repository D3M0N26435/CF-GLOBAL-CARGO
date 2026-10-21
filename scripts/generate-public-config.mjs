import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");
const examplePath = resolve(root, ".env.example");
const outputPath = resolve(root, "js/public-config.js");

function parseEnv(source) {
  const values = {};
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    values[key] = value;
  }
  return values;
}

const [exampleSource, envSource] = await Promise.all([
  readFile(examplePath, "utf8").catch((error) => error.code === "ENOENT" ? "" : Promise.reject(error)),
  readFile(envPath, "utf8").catch((error) => error.code === "ENOENT" ? "" : Promise.reject(error))
]);
const env = { ...parseEnv(exampleSource), ...parseEnv(envSource) };
const publicConfig = {
  socialTikTokUrl: env.SOCIAL_TIKTOK_URL || "",
  socialFacebookUrl: env.SOCIAL_FACEBOOK_URL || "",
  socialInstagramUrl: env.SOCIAL_INSTAGRAM_URL || "",
  socialWhatsAppUrl: env.SOCIAL_WHATSAPP_URL || "",
  whatsappGroupChinaUrl: env.WHATSAPP_GROUP_CHINA_URL || "",
  whatsappGroupChileUrl: env.WHATSAPP_GROUP_CHILE_URL || "",
  whatsappRecipient1: (env.WHATSAPP_QUOTE_RECIPIENT_1 || "").replace(/\D/g, ""),
  whatsappRecipient2: (env.WHATSAPP_QUOTE_RECIPIENT_2 || "").replace(/\D/g, "")
};

const output = `// Generado desde .env y .env.example. No agregues secretos aquí.\nwindow.APP_CONFIG = Object.freeze(${JSON.stringify(publicConfig, null, 2)});\n`;
await writeFile(outputPath, output, "utf8");
console.log("Configuración pública actualizada desde .env y .env.example en js/public-config.js.");
