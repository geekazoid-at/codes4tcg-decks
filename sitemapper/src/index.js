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
      .filter((dirent) => dirent.isDirectory()) // Ensure only directories are included
      .map((d) => ({ creator: creatorDir, deck: d.name }))
  );
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="https://codes4tcg.live/wp-content/plugins/google-sitemap-generator/sitemap.xsl"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gemfish.codes4tcg.live</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.9</priority>
  </url>
${creatorDirs
  .map(
    (cd) => `
  <url>
    <loc>https://gemfish.codes4tcg.live/list?author=${encodeURIComponent(
      cd
    )}</loc>
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
