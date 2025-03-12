import fs from "fs";
import { takeScreenshot } from "./screenshot.js";

const baseUrl = "https://decks.4tcg.live";

const main = async () => {
  //
  //
  const decksDir = fs.readdirSync("../decks");
  for (const author of decksDir) {
    const authorDecks = fs.readdirSync(`../decks/${author}`);
    for (const deck of authorDecks) {
      const targetDir = `../../decks-previews/${author}/${deck}`;
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      await takeScreenshot(
        `${baseUrl}/deckPokemon?author=${author}&id=${deck}`,
        `${targetDir}/preview.png`
      );

      console.log("1 deck done", new Date());
    }
  }
};

main();
