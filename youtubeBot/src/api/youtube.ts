import axios from "axios";

type Video = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
};

const API_KEY = "AIzaSyCrF9wwzpO0p-qK1JoaZXd2ZKlhMRfb714";

// Local Dev
// const API_KEY = "AIzaSyAVX9E9Li16lQ8phPUto_RzjsG3MUHSNvI";

export const getChannelName = async (channelId: string) => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          key: API_KEY,
          id: channelId,
          part: "snippet",
        },
      },
    );

    return response.data.items[0].snippet.title;
  } catch (error) {
    console.error("Error fetching channel name:", error);
    return null;
  }
};

const getPaginatedYouTubeVideos = async (
  channelId: string,
  pageSize: number,
  pageToken: string = "",
) => {
  try {
    const channelContentResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          key: API_KEY,
          id: channelId,
          part: "contentDetails",
        },
      },
    );

    const uploadsPlaylistId =
      channelContentResponse.data.items[0].contentDetails.relatedPlaylists
        .uploads;

    const playlistRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/playlistItems",
      {
        params: {
          key: API_KEY,
          playlistId: uploadsPlaylistId,
          part: "snippet,contentDetails",
          maxResults: pageSize,
          pageToken,
        },
      },
    );

    const videos = playlistRes.data.items.map((item: any) => ({
      id: item.contentDetails.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
    }));

    return {
      videos: videos,
      nextPageToken: playlistRes.data.nextPageToken,
    };
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return { videos: [], nextPageToken: null };
  }
};

export async function getAllVideos(
  channelId: string,
  pageSize: number,
  pageCount: number,
) {
  let allVideos: Video[] = [];
  let pageToken = "";

  let i = 0;

  do {
    const { videos, nextPageToken } = await getPaginatedYouTubeVideos(
      channelId,
      pageSize,
      pageToken,
    );

    allVideos = allVideos.concat(videos);
    pageToken = nextPageToken;
    i++;
  } while (pageToken && i < pageCount);

  console.log(`Total YouTube videos fetched: ${allVideos.length}`);
  return allVideos;
}
