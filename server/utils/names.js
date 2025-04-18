// 📁 server/utils/names.js

const noms = [
  'tonneau', 'bière', 'gobelin', 'nain', 'taverne', 'pinte', 'chope', 'grimoire',
  'chopine', 'cochon', 'barde', 'crâne', 'lutin', 'hydromel', 'gnome', 'chaudron'
];

function generateFunnyName() {
  const index = Math.floor(Math.random() * noms.length);
  return noms[index];
}

module.exports = { generateFunnyName };
