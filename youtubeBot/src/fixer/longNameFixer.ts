import fs from "fs";
import { fixLongWords } from "../processVideo";
import { VideoMeta } from "../types";

async function main() {
  // iterate over decks
  fs.readdirSync("../decks").forEach((creator) => {
    const creatorPath = `../decks/${creator}`;

    if (!fs.lstatSync(creatorPath).isDirectory()) {
      return;
    }

    fs.readdirSync(creatorPath).forEach((video) => {
      const videoPath = `${creatorPath}/${video}`;

      if (!fs.lstatSync(videoPath).isDirectory()) {
        return;
      }

      const metaPath = `${videoPath}/meta.json`;
      if (!fs.existsSync(metaPath)) {
        return;
      }
      const meta: VideoMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      const fixedName = fixLongWords(meta.name);

      if (fixedName !== meta.name) {
        console.log(
          `Fixing long name for ${creator} / ${video}: ${meta.name} -> ${fixedName}`
        );
        meta.name = fixedName;
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      }
    });
  });
}

main();
