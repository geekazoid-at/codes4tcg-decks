const axios = require("axios");
const fs = require("fs");

const API_KEY = "AIzaSyCrF9wwzpO0p-qK1JoaZXd2ZKlhMRfb714"; // Replace with your YouTube Data API key
const CHANNEL_ID = "UCAhRWmekXLryJOZRUYR4seQ"; // Replace with the channel ID
const MAX_RESULTS = 10;

const getChannelName = async () => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          key: API_KEY,
          id: CHANNEL_ID,
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

const getYouTubeVideos = async (pageToken = "") => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: API_KEY,
          channelId: CHANNEL_ID,
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
  const channelName = await getChannelName();
  let allVideos = [];
  let pageToken = "";

  let i = 0;

  do {
    const { videos, nextPageToken } = await getYouTubeVideos(pageToken);
    allVideos = allVideos.concat(videos);
    pageToken = nextPageToken;

    i++;
  } while (pageToken && i < 1);

  console.log(`Channel: ${channelName}`);
  console.log(`Total YouTube videos fetched: ${allVideos.length}`);
  await allVideos.forEach(async (video, index) => {
    const name = video.title;
    const description = video.description;
    const publishedAt = video.publishedAt;

    let deck = description.substring(description.indexOf("Pokémon:") || 0);

    const ii = deck.indexOf("Total Cards: 60");
    deck = deck.substring(0, ii > -1 ? ii + 15 : deck.length).trim();

    if (!deck.includes("Pokémon:") && !deck.includes("Pokemon:")) {
      console.log("No deck found");
      return;
    }

    console.log(`Title: ${name}`);
    console.log(`Published At: ${publishedAt}`);
    // console.log(`Deck: ${deck}`);

    const deckId = `yt-${channelName}-${video.id}`;
    const dirName = deckId; //await generateDeckName(name, description, deck);

    fs.mkdirSync(`../decks/${channelName}/${dirName}`, {
      recursive: true,
    });

    fs.writeFileSync(`../decks/${channelName}/${dirName}/deck.txt`, deck);

    const meta = {
      id: deckId,
      name: name,
      author: channelName,
      link: `https://www.youtube.com/watch?v=${video.id}`,
      publishedAt: new Date(publishedAt),
      coverCards: [],
      tags: [],
      legalities: { standard: !description.includes("expanded") },
    };

    fs.writeFileSync(
      `../decks/${channelName}/${deckId}/meta.json`,
      JSON.stringify(meta, null, 2)
    );
  });
};

// AI
const OpenAI = require("openai");

const openai = new OpenAI({
  // apiKey: OPENAI_API_KEY,
});

async function generateDeckName(deckVideoTitle, deckDescription, deckList) {
  console.log("wait");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: fs.readFileSync("./src/prompt.txt", "utf8"),
        },
        {
          role: "user",
          content: `Title: ${deckVideoTitle}, Description: ${deckDescription}, Deck List: ${deckList}`,
        },
      ],
    });

    console.log("done");
    const deckName = completion.choices[0].message.content.trim();
    return deckName;
  } catch (error) {
    console.error("Error generating deck name:", error);
    return null;
  }
}

main();
