import axios from "axios";

const API_KEY = "AIzaSyCrF9wwzpO0p-qK1JoaZXd2ZKlhMRfb714";

const MAX_RESULTS = 50;

export const getChannelName = async (channelId) => {
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

export const getYouTubeVideos = async (channelId, pageToken = "") => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: API_KEY,
          channelId,
          part: "snippet",
          order: "date",
          maxResults: MAX_RESULTS,
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
