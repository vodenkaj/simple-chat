const socket = io();
const messages = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const modal = document.getElementById("modal-error");
const blur = document.getElementById("blur");
const statusMsg = modal.children[1];
const infoPopup = document.getElementById("info-popup");

// Is set after logged evet is fired
let username;

form.onsubmit = (e) => {
	e.preventDefault();
	if (input.value) {
		socket.emit("chat message", input.value);
		input.value = "";
	}
}

socket.on("logged", (msg) => {
	username = msg;
})

socket.on("chat message", (msg) => {
	infoPopup.style.display = "none";
	messages.appendChild(message(msg));
	messages.scrollTo(0, messages.lastChild.offsetTop);
})

socket.on("exceeded limit", msg => {
	infoPopup.style.display = "flex";
	infoPopup.children[0].textContent = msg;
});

socket.on("spam timer", msg => {
	infoPopup.style.display = "flex";
	infoPopup.children[0].textContent = msg;
});

socket.on("disconnected", msg => {
	blur.style.display = "flex";
	modal.style.display = "flex";
	statusMsg.textContent = msg;
});

function message(msg) {
	const el = document.createElement("li");
	if (username == msg.username) {
		el.classList.add("reverse");
	}
	el.innerHTML =
		"<p><strong>" +
		msg.username +
		"</strong></p>" +
		"<div>" +
		msg.text +
		"</div>" +
		"<p class='date'>" +
		getFormattedDate() +
		"</p>";
	return el;
}

function getFormattedDate() {
	let date = new Date();
	return date.getHours() + ":" + date.getMinutes() + " " + + date.getDate() + "." + date.getMonth() + "." + date.getFullYear();
}
