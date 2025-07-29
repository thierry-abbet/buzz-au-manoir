const { generateRoomName } = require('./names');

const roomNames = [
  "Tonneau", "Gobelet", "Nain", "Pinte", "Chope", "Tavernier", "Goulet",
  "Mousse", "Poivrot", "Troll", "Taverne", "Rôti", "Sauciflard", "Sanglier"
];

test('generateRoomName returns a valid room name', () => {
  for (let i = 0; i < 20; i++) {
    const name = generateRoomName();
    expect(roomNames).toContain(name);
  }
});
