const world = document.querySelector("#world");
const status = document.querySelector("#status");
const nameInput = document.querySelector("#name");
const saveName = document.querySelector("#saveName");

const socket = new WebSocket(`ws://${location.host}`);
let myId = null;
let players = [];
const keys = new Set();

socket.addEventListener("open", () => status.textContent = "Connected");
socket.addEventListener("close", () => status.textContent = "Disconnected");
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.type === "welcome") myId = message.id;
  if (message.type === "state") {
    players = message.players;
    render();
  }
});

saveName.addEventListener("click", () => {
  socket.send(JSON.stringify({ type: "name", name: nameInput.value }));
});

addEventListener("keydown", e => keys.add(e.key.toLowerCase()));
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));

function render() {
  world.innerHTML = "";
  for (const player of players) {
    const el = document.createElement("div");
    el.className = `player${player.id === myId ? " me" : ""}`;
    el.style.left = `${player.x}px`;
    el.style.top = `${player.y}px`;
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = player.name;
    el.appendChild(label);
    world.appendChild(el);
  }
}

setInterval(() => {
  const me = players.find(p => p.id === myId);
  if (!me || socket.readyState !== WebSocket.OPEN) return;

  let x = me.x, y = me.y;
  const speed = 7;
  if (keys.has("a") || keys.has("arrowleft")) x -= speed;
  if (keys.has("d") || keys.has("arrowright")) x += speed;
  if (keys.has("w") || keys.has("arrowup")) y -= speed;
  if (keys.has("s") || keys.has("arrowdown")) y += speed;

  x = Math.max(15, Math.min(785, x));
  y = Math.max(15, Math.min(485, y));

  if (x !== me.x || y !== me.y) {
    socket.send(JSON.stringify({ type: "move", x, y }));
  }
}, 50);
