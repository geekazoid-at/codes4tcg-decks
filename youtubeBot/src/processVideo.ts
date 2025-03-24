import fs from "fs";

import { DeckMeta, Video, VideoMeta } from "./types";
import { germanToEnglish, transformDeck } from "./utils/deckTransformer";

type DeckResult = { meta: DeckMeta; deck: string };

export async function processVideo(
  video: Video,
  channelName: string
): Promise<{ meta: VideoMeta; decks: DeckResult[] } | null> {
  const videoName = video.title;
  const publishedAtDate = new Date(video.publishedAt);

  const formattedDate = `${publishedAtDate.getFullYear()}-${
    publishedAtDate.getMonth() + 1 < 10 ? "0" : ""
  }${publishedAtDate.getMonth() + 1}-${
    publishedAtDate.getDate() < 10 ? "0" : ""
  }${publishedAtDate.getDate()}`;

  const videoId = `yt-${formattedDate}-${channelName}-${video.id}`;

  let videoMeta: VideoMeta = {
    id: videoId,
    name: videoName,
    author: channelName,
    link: `https://www.youtube.com/watch?v=${video.id}`,
    publishedAt: publishedAtDate,
    tags: [],
  };

  const description = video.description;

  const decks = processDescription(description, videoId);

  if (!videoMeta || !decks || !decks.length) {
    return null;
  }

  return { meta: videoMeta, decks };
}

export function processDescription(
  description: string,
  videoId: string
): DeckResult[] | null {
  let decks: DeckResult[] = [];

  let inDeck = false;
  let inEnergy = false;

  let videoDescription = germanToEnglish(description);

  // Fix trust your pilot decks
  videoDescription = videoDescription
    .split("\n")
    .map((t, index, arr) => {
      if (t.match(/[A-Za-z+ ]+:/g)?.length) {
        inDeck = true;
      }

      if (t.match(/Energy: \d+/g)?.length) {
        inEnergy = true;
      }

      if (!t.trim() && inDeck && inEnergy) {
        if (arr[index + 1].includes("Total Cards:")) {
          inDeck = false;
          inEnergy = false;

          return t;
        }

        inDeck = false;
        inEnergy = false;
        return "\nTotal Cards: 60";
      }

      return t;
    })
    .join("\n");

  if (
    !videoDescription.includes("Total Cards:") ||
    !(
      videoDescription.includes("Pokémon:") ||
      videoDescription.includes("Pokemon:")
    )
  ) {
    return null;
  }

  const totalDecks = (videoDescription.match(/Total Cards:/g) || []).length;

  let deckIndex = 1;

  if (!videoDescription.includes("Total Cards: 60")) {
    return null;
  }

  while (videoDescription.includes("Total Cards:")) {
    let deckName: string | null = null;

    if (totalDecks > 1) {
      const lines = videoDescription
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const deckStartsAt = lines.findIndex(
        (line) => line.includes("Pokémon:") || line.includes("Pokemon:")
      );

      deckName = lines[deckStartsAt - 1];

      if (deckName?.endsWith(":")) {
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
      // console.log("Null1", decks);
      return null;
    }

    // Advance description to possibly next deck
    videoDescription = videoDescription.substring(
      videoDescription.indexOf(deck) + deck.length
    );

    // Deck itself
    deck = deck.replaceAll("BSR", "BRS");

    // Normalize the deck text
    deck = transformDeck(deck);

    const coverCards: string[] = [];

    deck.split(/\r?\n/).forEach((line) => {
      const match = line.match(/(\d+) (.+?) ([A-Z\-]+) (\d+)?/);
      if (!match) return;

      const [, , name] = match;

      if (
        name.endsWith(" ex") ||
        name.endsWith(" V") ||
        name.endsWith(" VMAX") ||
        name.endsWith(" VSTAR")
      ) {
        coverCards.push(line.substring(line.indexOf(" ") + 1));
      }
    });

    const deckMeta: DeckMeta = {
      videoId,
      index: deckIndex,
      coverCards,
      tags: [],
      legalities: { standard: !videoDescription.includes("expanded") },
    };

    if (totalDecks > 1) {
      if (deckName && !deckName.includes("https://")) {
        deckMeta.name = deckName;
      } else {
        deckMeta.name = `Deck ${deckIndex}`;
      }

      deckMeta.index = deckIndex;
    }

    decks.push({ meta: deckMeta, deck });

    deckIndex++;
  }

  return decks;
}
