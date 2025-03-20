import axios from "axios";

const API_KEY = "AIzaSyCrF9wwzpO0p-qK1JoaZXd2ZKlhMRfb714";

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

const getYouTubeVideos = async (channelId, pageSize, pageToken = "") => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: API_KEY,
          channelId,
          part: "snippet",
          order: "date",
          maxResults: pageSize,
          pageToken,
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

export async function getAllVideos(channelId, pageSize, pageCount) {
  const channelName = await getChannelName(channelId);

  console.log(`Channel: ${channelName}`);
  let allVideos = [];
  let pageToken = "";

  let i = 0;

  do {
    const { videos, nextPageToken } = await getYouTubeVideos(
      channelId,
      pageSize,
      pageToken
    );

    allVideos = allVideos.concat(videos);
    pageToken = nextPageToken;
    i++;
  } while (pageToken && i < pageCount);

  console.log(`Total YouTube videos fetched: ${allVideos.length}`);
  return { allVideos, channelName };
}
