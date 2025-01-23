const fs = require("fs");

const ENERGIES = {
  "Lightning Energy": { texts: ["{L}", "Lightning"], number: 4 },
  "Psychic Energy": { texts: ["{P}", "Psychic"], number: 5 },
  "Metal Energy": { texts: ["{M}", "Metal"], number: 8 },
  "Grass Energy": { texts: ["{G}", "Grass"], number: 1 },
  "Fighting Energy": { texts: ["{F}", "Fighting"], number: 6 },
  "Fire Energy": { texts: ["{R}", "Fire"], number: 2 },
  "Water Energy": { texts: ["{W}", "Water"], number: 3 },
  "Darkness Energy": { texts: ["{D}", "Darkness"], number: 7 },
  "Fairy Energy": { texts: ["{Y}", "Fairy"], number: 1 },
};

// Should go into Bot
// Bot should also check decks if all are valid
// TODO
function transformEnergyName(line) {
  const energyKeys = Object.keys(ENERGIES);

  const k = energyKeys.find((key) => line.includes(key));

  if (line.includes("Fire Energy")) {
    console.log("Found", k, line);
  }

  if (!k) {
    return line;
  }

  const e = ENERGIES[k];

  const t = `${line.substring(0, line.indexOf(" "))} Basic ${
    e.texts[0]
  } Energy SVE ${e.number}`;

  // console.log(t);

  return t;
}

function transformDeck(deck) {
  return deck
    .split("\n")
    .map((line) => {
      if (!/^\d/.test(line)) {
        return line;
      }

      // Check for and fix the Paf183 or PAF183 situation
      return line.replace(/([A-Za-z]+)(\d+)/g, (match, p1, p2) => {
        return `${p1.toUpperCase()} ${p2}`;
      });
    })
    .map((line) => transformEnergyName(line))
    .join("\n");
}

module.exports = {
  transformDeck,
};
