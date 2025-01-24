const axios = require("axios");
const fs = require("fs");
const transformDeck = require("./deckTransformer").transformDeck;

const API_KEY = "AIzaSyCrF9wwzpO0p-qK1JoaZXd2ZKlhMRfb714"; // Replace with your YouTube Data API key

const channelIds = [
  //"UCkIP7BHKg-6NN56eVXfrmJw", // Pokephil
  // "UCAhRWmekXLryJOZRUYR4seQ", // LDF
  "UCZiUkbtzrEzCiDZ09oZYBbQ", // Trust your pilot
];

const MAX_RESULTS = 50;

const getChannelName = async (channelId) => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          key: API_KEY,
          id: channelId,
          part: "snippet",
        },
      }
    );

    const channelName = response.data.items[0].snippet.title;
    return channelName;
  } catch (error) {
    console.error("Error fetching channel name:", error);
    return null;
  }
};

const getYouTubeVideos = async (channelId, pageToken = "") => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: API_KEY,
          channelId: channelId,
          part: "snippet",
          order: "date",
          maxResults: MAX_RESULTS,
          pageToken: pageToken,
        },
      }
    );

    const videoIds = response.data.items
      .map((item) => item.id.videoId)
      .join(",");

    const videoDetailsResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          key: API_KEY,
          id: videoIds,
          part: "snippet",
        },
      }
    );

    const videos = videoDetailsResponse.data.items.map((item) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
    }));

    return {
      videos: videos,
      nextPageToken: response.data.nextPageToken,
    };
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return { videos: [], nextPageToken: null };
  }
};

const main = async () => {
  for (const channelId of channelIds) {
    const channelName = await getChannelName(channelId);
    let allVideos = [];
    let pageToken = "";

    let i = 0;

    do {
      const { videos, nextPageToken } = await getYouTubeVideos(
        channelId,
        pageToken
      );
      allVideos = allVideos.concat(videos);
      pageToken = nextPageToken;
      i++;
    } while (pageToken && i < 5);

    console.log(`Channel: ${channelName}`);
    console.log(`Total YouTube videos fetched: ${allVideos.length}`);

    await allVideos.forEach(async (video, index) => {
      const name = video.title;
      let description = video.description;

      // german to english
      description = description.replaceAll("Energie:", "Energy:");
      description = description.replaceAll(
        "Karten insgesamt: ",
        "Total Cards: "
      );

      if (!description.includes("Total Cards:")) {
        console.log("No deck END found");
        console.log("---------------------------------");
        return;
      }

      const publishedAt = video.publishedAt;

      let deckIndex = 1;

      // Count how often description includes "Total Cards:"
      const totalDecks = description.match(/Total Cards:/g).length;

      while (description.includes("Total Cards:")) {
        let deck = description.substring(description.indexOf("Pokémon:") || 0);

        const ii = deck.indexOf("Total Cards: 60");
        deck = deck.substring(0, ii > -1 ? ii + 15 : deck.length).trim();

        // Advance description to possibly next deck
        description = description.substring(
          description.indexOf(deck) + deck.length
        );

        console.log(`Title: ${name}`);
        console.log(`Published At: ${publishedAt}`);
        console.log(`Deck: ${deck}`);

        if (!deck.includes("Pokémon:") && !deck.includes("Pokemon:")) {
          console.log("No deck found");
          console.log("---------------------------------");
          return;
        }

        deck = deck.replaceAll("BSR", "BRS");

        // Normalize the deck text
        deck = transformDeck(deck);

        const date = new Date(publishedAt);
        const formattedDate = `${date.getFullYear()}-${
          date.getMonth() + 1 < 10 ? "0" : ""
        }${date.getMonth() + 1}-${
          date.getDate() < 10 ? "0" : ""
        }${date.getDate()}`;

        const deckId = `yt-${formattedDate}-${channelName}-${video.id}-${deckIndex}`;
        const dirName = deckId;

        fs.mkdirSync(`../decks/${channelName}/${dirName}`, {
          recursive: true,
        });

        fs.writeFileSync(`../decks/${channelName}/${dirName}/deck.txt`, deck);

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

        const meta = {
          id: deckId,
          name: name,
          author: channelName,
          link: `https://www.youtube.com/watch?v=${video.id}`,
          publishedAt: new Date(publishedAt),
          coverCards,
          tags: [],
          legalities: { standard: !description.includes("expanded") },
        };

        if (totalDecks > 1) {
          meta.index = deckIndex;
        }

        fs.writeFileSync(
          `../decks/${channelName}/${deckId}/meta.json`,
          JSON.stringify(meta, null, 2)
        );
        console.log("---------------------------------");

        deckIndex++;
      }
    });
  }
};

main();
