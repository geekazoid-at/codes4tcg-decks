import fs from "fs";

import { getAllVideos } from "./api/youtube";
import { processVideo } from "./processVideo";
import { Video } from "./types";

const channelIdTyp = "UCZiUkbtzrEzCiDZ09oZYBbQ"; // Trust your pilot
const channelIdPp = "UCkIP7BHKg-6NN56eVXfrmJw"; // Pokephil
const channelIdLdf = "UCAhRWmekXLryJOZRUYR4seQ"; // LDF
const channelIdFtw = "UCAQKOO0Evm2TENo0UCZR-pg"; // ForTheWinTCG
const channelIdStb = "UCCLD0ptegGoRv8RHuhgZR_A"; // snipe the bench
const channelIdSneaker = "UCBjjolWH6d6JJRCZ6a02N6w"; // SneakerTalkTCG
const channelIdMrdog = "UCMS0qK1Or_qElPXCgmkCUhw"; // MrDog
const channelId3rd = "UCtjNWKdNFOdMv6QEUfSN8TQ"; // in3rdperson
const channelIdPop = "UCaJRkZn63jCodODUOyGPiiA"; // PopsicleKnight
const channelIdGym = "UC35KRaWGA7hQ5De40GG_7Fw"; // TrickyGym
const channelIdZapdos = "UCYCzQRsPJ_eUEXXmU_CSx2g"; // ZapdosTCG
const channelIdGinJ = "UCG73skhpwL7MF0Fb6RufGTQ"; // GinJTCG
const channelIdPat = "UCLryZvbuOJNmRCp_OI-VoTg"; // CoolTrainerPat
const channelId10t = "UCGt88fXOvxhyXZrj5MDKQwQ"; // 10 types gaming
const channelIdSTCG = "UCSmwbnSsbzy53z6AnSkGYkg"; // Strategic TCG

const allChannelIds: string[] = [
  channelIdTyp,
  channelIdPp,
  channelIdLdf,
  channelIdFtw,
  channelIdStb,
  channelIdSneaker,
  channelIdMrdog,
  channelId3rd,
  channelIdPop,
  channelIdGym,
  channelIdZapdos,
  channelIdGinJ,
  channelIdPat,
  channelId10t,
  channelIdSTCG,
];

const main = async (
  channelId: string,
  pageSize: number,
  pageCount: number
): Promise<void> => {
  const {
    channelName,
    allVideos,
  }: { channelName: string; allVideos: Video[] } = await getAllVideos(
    channelId,
    pageSize,
    pageCount
  );

  for (const video of allVideos) {
    const videoData = await processVideo(video, channelName);

    if (!videoData) {
      console.log("Skip, no data");
      continue;
    }

    const { meta: videoMeta, decks } = videoData;

    fs.mkdirSync(`../decks/${channelName}/${videoMeta.id}`, {
      recursive: true,
    });

    fs.writeFileSync(
      `../decks/${channelName}/${videoMeta.id}/meta.json`,
      JSON.stringify(videoMeta, null, 2)
    );

    for (const deck of decks) {
      fs.mkdirSync(
        `../decks/${channelName}/${videoMeta.id}/${deck.meta.index}`,
        {
          recursive: true,
        }
      );

      fs.writeFileSync(
        `../decks/${channelName}/${videoMeta.id}/${deck.meta.index}/deck.txt`,
        deck.deck
      );

      fs.writeFileSync(
        `../decks/${channelName}/${videoMeta.id}/${deck.meta.index}/meta.json`,
        JSON.stringify(deck.meta, null, 2)
      );
    }
  }
};

enum RunType {
  IMPORT = "IMPORT",
  UPDATE = "UPDATE",
}

const importChannelId = channelIdPp;
const RUNTYPE: RunType = RunType.UPDATE;

if (RUNTYPE === (RunType.IMPORT as RunType)) {
  main(importChannelId, 50, 5);
} else if (RUNTYPE === (RunType.UPDATE as RunType)) {
  for (const channelId of allChannelIds) {
    main(channelId, 5, 1);
  }
}
