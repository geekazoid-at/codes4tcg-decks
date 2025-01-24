import fs from "fs";

import { germanToEnglish, transformDeck } from "./utils/deckTransformer.js";
import { getYouTubeVideos, getChannelName } from "./api/youtube.js";

// const channelId = "UCZiUkbtzrEzCiDZ09oZYBbQ"; // Trust your pilot
// const channelId = "UCkIP7BHKg-6NN56eVXfrmJw"; // Pokephil
const channelId = "UCAhRWmekXLryJOZRUYR4seQ"; // LDF

const main = async () => {
  const { videos: allVideos } = await getYouTubeVideos(channelId);
  const channelName = await getChannelName(channelId);

  console.log(`Channel: ${channelName}`);
  console.log(`Total YouTube videos fetched: ${allVideos.length}`);

  await allVideos.forEach(async (video) => {
    const videoName = video.title;
    const publishedAt = video.publishedAt;

    let videoDescription = germanToEnglish(video.description);

    if (
      !videoDescription.includes("Total Cards:") ||
      !(
        videoDescription.includes("Pokémon:") ||
        videoDescription.includes("Pokemon:")
      )
    ) {
      console.log("No deck found 1");
      console.log("---------------------------------");
      return;
    }

    const totalDecks = videoDescription.match(/Total Cards:/g).length;

    let deckIndex = 1;
    let videoMetaWritten = false;

    while (videoDescription.includes("Total Cards:")) {
      let deckName = null;

      if (totalDecks > 1) {
        const lines = videoDescription
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        const deckStartsAt = lines.findIndex(
          (line) => line.includes("Pokémon:") || line.includes("Pokemon:")
        );

        deckName = lines[deckStartsAt - 1];

        if (deckName.endsWith(":")) {
          deckName = deckName.substring(0, deckName.length - 1);
        }
      }

      let deck = videoDescription.substring(
        videoDescription.indexOf("Pokémon:") || 0
      );

      deck = deck.substring(0, deck.indexOf("Total Cards: 60") + 15).trim();

      if (
        !videoDescription.includes("Total Cards:") ||
        !(deck.includes("Pokémon:") || deck.includes("Pokemon:"))
      ) {
        console.log("No deck found 2");
        console.log("---------------------------------");
        return;
      }

      // Advance description to possibly next deck
      videoDescription = videoDescription.substring(
        videoDescription.indexOf(deck) + deck.length
      );

      console.log(`Title: ${videoName}`);

      // Deck itself
      deck = deck.replaceAll("BSR", "BRS");

      // Normalize the deck text
      deck = transformDeck(deck);

      const date = new Date(publishedAt);
      const formattedDate = `${date.getFullYear()}-${
        date.getMonth() + 1 < 10 ? "0" : ""
      }${date.getMonth() + 1}-${
        date.getDate() < 10 ? "0" : ""
      }${date.getDate()}`;

      const videoId = `yt-${formattedDate}-${channelName}-${video.id}`;

      fs.mkdirSync(`../decks/${channelName}/${videoId}/${deckIndex}`, {
        recursive: true,
      });

      fs.writeFileSync(
        `../decks/${channelName}/${videoId}/${deckIndex}/deck.txt`,
        deck
      );

      const coverCards = [];

      deck.split(/\r?\n/).forEach((line) => {
        const [_, quantity, name, set, number] =
          line.match(/(\d+) (.+?) ([A-Z\-]+) (\d+)?/) || [];

        if (!name) {
          return;
        }

        if (
          name.endsWith(" ex") ||
          name.endsWith(" V") ||
          name.endsWith(" VMAX") ||
          name.endsWith(" VSTAR")
        ) {
          coverCards.push(line.substring(line.indexOf(" ") + 1));
        }
      });

      const deckMeta = {
        videoId,
        index: deckIndex,
        coverCards,
        tags: [],
        legalities: { standard: !videoDescription.includes("expanded") },
      };

      if (deckName) {
        deckMeta.name = deckName;
      }

      if (totalDecks > 1) {
        deckMeta.index = deckIndex;
      }

      fs.writeFileSync(
        `../decks/${channelName}/${videoId}/${deckIndex}/meta.json`,
        JSON.stringify(deckMeta, null, 2)
      );

      console.log("---------------------------------");

      deckIndex++;

      if (!videoMetaWritten) {
        const videoMeta = {
          id: videoId,
          name: videoName,
          author: channelName,
          link: `https://www.youtube.com/watch?v=${video.id}`,
          publishedAt: new Date(publishedAt),
          tags: [],
          decksCount: totalDecks,
        };

        fs.writeFileSync(
          `../decks/${channelName}/${videoId}/meta.json`,
          JSON.stringify(videoMeta, null, 2)
        );

        videoMetaWritten = true;
      }
    }
  });
};

main();
