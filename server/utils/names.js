const roomNames = [
  "Tonneau", "Gobelet", "Nain", "Pinte", "Chope", "Tavernier", "Goulet",
  "Mousse", "Poivrot", "Troll", "Taverne", "Rôti", "Sauciflard", "Sanglier"
];

function generateRoomName() {
  const index = Math.floor(Math.random() * roomNames.length);
  return roomNames[index];
}

module.exports = { generateRoomName };
