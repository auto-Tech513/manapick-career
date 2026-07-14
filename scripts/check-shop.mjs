import fs from "node:fs/promises";

const shop = await fs.readFile(new URL("../content/shop-products.ts", import.meta.url), "utf8");
const page = await fs.readFile(new URL("../app/shop/page.tsx", import.meta.url), "utf8");
const sources = JSON.parse(await fs.readFile(new URL("../content/source-registry.json", import.meta.url), "utf8"));
const sourceIds = new Set(sources.map((source) => source.sourceId));
const failures = [];
const productIds = [...shop.matchAll(/^\s+id: "([^"]+)",$/gm)].map((match) => match[1]);
const referencedSources = [...shop.matchAll(/^\s+sourceId: "([^"]+)",$/gm)].map((match) => match[1]);
const officialUrls = [...shop.matchAll(/^\s+officialUrl: "([^"]+)",$/gm)].map((match) => match[1]);
const amazonUrls = [...shop.matchAll(/^\s+amazonUrl: "([^"]+)",$/gm)].map((match) => match[1]);

if (productIds.length < 6) failures.push(`shop has only ${productIds.length} products`);
if (new Set(productIds).size !== productIds.length) failures.push("duplicate shop product id");
if (!shop.includes('associateTag: "saunastampral-22"')) failures.push("approved Amazon associate tag is missing");
if (officialUrls.length !== productIds.length || officialUrls.some((url) => !url.startsWith("https://"))) failures.push("every product must have an HTTPS official source");
if (amazonUrls.length !== productIds.length || amazonUrls.some((url) => !url.startsWith("https://www.amazon.co.jp/") || !new URL(url).searchParams.has("tag") || new URL(url).searchParams.get("tag") !== "saunastampral-22")) failures.push("every Amazon link must use the approved associate tag");
if (/^\s+(?:epc|reward|approvalRate|reviewCount|ratingValue|price):/gmi.test(shop)) failures.push("shop data includes prohibited ranking/volatile commerce fields");
for (const sourceId of referencedSources) if (!sourceIds.has(sourceId)) failures.push(`unknown shop source ${sourceId}`);
if (referencedSources.length !== productIds.length) failures.push("every product must have exactly one registered official source");
if (!page.includes('rel="sponsored nofollow noopener noreferrer"')) failures.push("Amazon links lack sponsored disclosure");
if (!page.includes("PR・Amazon") || !page.includes("careerShopPolicy.disclosure") || !shop.includes("Amazonのアソシエイト")) failures.push("visible PR disclosure is missing");
const images = [...shop.matchAll(/^\s+image: "([^\"]+)",$/gm)].map((match) => match[1]);
const imageCredits = [...shop.matchAll(/^\s+imageCredit: "([^\"]+)",$/gm)].map((match) => match[1]);
if (images.length !== productIds.length || images.some((image) => !image.startsWith("/shop/"))) failures.push("every product must have a local product image path");
if (imageCredits.length !== productIds.length || imageCredits.some((credit) => !credit.includes("画像出典：") || !credit.includes("利用許諾は公開前確認"))) failures.push("every product image must show its source and permission-pending status");
if (!page.includes("product.image") || !page.includes("product.imageCredit")) failures.push("product image or source credit is not rendered");

if (failures.length) { failures.forEach((failure) => console.error(`ERROR ${failure}`)); process.exit(1); }
console.log(`shop check: ${productIds.length} products / ${referencedSources.length} official sources / PR disclosure, image paths, and source labels present`);
