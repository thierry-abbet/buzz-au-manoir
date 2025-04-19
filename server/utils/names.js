// 📁 server/utils/names.js

const names = [
  "tonneau", "biere", "gobelin", "nain", "taverne", "choppe", "gnôle",
  "grimoire", "soulerie", "bardasse", "mirobolant", "bouzin", "flasque",
  "guinde", "cervoise", "jambonneau", "torchon", "pinte", "galopin", "sauciflard"
];

function generateRoomName() {
  const index = Math.floor(Math.random() * names.length);
  return names[index];
}

module.exports = { generateRoomName };
