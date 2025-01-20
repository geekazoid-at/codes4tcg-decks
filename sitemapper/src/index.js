const fs = require("fs");

let foundDecks = [];

// Iterate recursively over ../decks, deck dirs are the leaf dirs
const creatorDirs = fs
  .readdirSync("../decks", { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

console.log("Found creators: ", creatorDirs);

// Iterate over each deck and generate a sitemap
creatorDirs.forEach((creatorDir) => {
  foundDecks.push(
    ...fs
      .readdirSync(`../decks/${creatorDir}`, {
        withFileTypes: true,
      })
      .map((d) => ({ creator: creatorDir, deck: d }))
  );
});

console.log("Found decks: ", foundDecks);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${foundDecks
  .map(
    (deck) => `
  <url>
    <loc>https://codes4tcg.live/deck?author=${deck.creator}&id=${
      deck.deck.name
    }</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("")}
</urlset>`;

fs.writeFileSync(`./sitemap.xml`, sitemap);

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
