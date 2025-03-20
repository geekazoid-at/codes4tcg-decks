import fs from "fs";
import { processDescription } from "../processVideo";

async function test1() {
  console.log("RUNNING: test1");

  const description = fs.readFileSync("./src/test/description1.txt", "utf-8");

  const deckData = processDescription(description, "TestID-1");

  if (!deckData || deckData.length !== 1 || deckData[0].meta.name) {
    throw new Error("FAILED: test1");
  }

  console.log("COMPLETED: test1");
}

test1();
