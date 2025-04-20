import fs from "fs";
import { processDescription } from "../processVideo";

async function test1() {
  console.log("RUNNING: test1");

  const description = fs.readFileSync("./src/test/description1.txt", "utf-8");

  const deckData = processDescription(description, "TestID-1");

  if (!deckData || deckData.length !== 1 || deckData[0].meta.name) {
    console.log(deckData);
    throw new Error("FAILED: test1");
  }

  console.log("COMPLETED: test1");
}

async function test2() {
  console.log("RUNNING: test2");

  const description = fs.readFileSync("./src/test/description2.txt", "utf-8");

  const deckData = processDescription(description, "TestID-2");

  if (!deckData || deckData.length !== 1 || deckData[0].meta.name) {
    console.log(deckData);
    throw new Error("FAILED: test2");
  }

  console.log("COMPLETED: test2");
}

async function test3() {
  console.log("RUNNING: test3");

  const description = fs.readFileSync("./src/test/description3.txt", "utf-8");

  const deckData = processDescription(description, "TestID-3");

  if (!deckData || deckData.length !== 1 || deckData[0].meta.name) {
    console.log(deckData);
    throw new Error("FAILED: test3");
  }

  console.log("COMPLETED: test3");
}

test1();
test2();
test3();
