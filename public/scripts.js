// public/scripts.js

document.addEventListener("DOMContentLoaded", async () => {
  const isDj = new URLSearchParams(window.location.search).get("dj") === "true";
  const socket = io();

  const roomNameElem = document.getElementById("roomName");
  const buzzButton = document.getElementById("buzzButton");
  const statusText = document.getElementById("status");

  if (isDj) {
    // DJ crée la salle
    socket.emit("createRoom");

    socket.on("roomCreated", (roomName) => {
      roomNameElem.textContent = roomName;
      socket.emit("joinRoom", { room: roomName, name: "DJ", isDj: true });
    });

    socket.on("buzz", (name) => {
      statusText.textContent = `${name} a buzzé en premier ! 🎉`;
    });

    buzzButton.addEventListener("click", () => {
      socket.emit("buzz");
    });
  } else {
    // Côté joueur
    const lobby = document.getElementById("lobby");
    const joinBtn = document.getElementById("joinBtn");

    joinBtn.addEventListener("click", () => {
      let inputRoom = document.getElementById("roomInput").value.trim();

      // Auto-correction : première lettre majuscule, le reste en minuscule
      inputRoom = inputRoom.charAt(0).toUpperCase() + inputRoom.slice(1).toLowerCase();

      if (!inputRoom) return alert("Veuillez entrer un nom de partie.");

      // Vérifie que la salle existe avant de demander le pseudo
      socket.emit("checkRoom", inputRoom, (exists) => {
        if (!exists) {
          alert("Cette salle n'existe pas !");
          return;
        }

        const name = prompt("Entrez votre prénom :").trim();
        if (!name) return;

        socket.emit("joinRoom", { room: inputRoom, name, isDj: false });

        // Cache le lobby et montre la salle
        lobby.style.display = "none";
        roomNameElem.textContent = inputRoom;
        document.getElementById("room").style.display = "block";
      });
    });

    socket.on("buzz", (name) => {
      statusText.textContent = `${name} a buzzé !`;
    });

    buzzButton.addEventListener("click", () => {
      socket.emit("buzz");
    });
  }
});
