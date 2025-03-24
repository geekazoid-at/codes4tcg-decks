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

async function test2() {
  console.log("RUNNING: test2");

  const description = fs.readFileSync("./src/test/description2.txt", "utf-8");

  const deckData = processDescription(description, "TestID-2");

  if (!deckData || deckData.length !== 1 || deckData[0].meta.name) {
    throw new Error("FAILED: test2");
  }

  console.log("COMPLETED: test2");
}

test1();
test2();
