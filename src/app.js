import io from "socket.io-client";

const socket = io();

const sendMessage = evt => {
    evt.preventDefault();
    const msg = evt.target.children[0].value;
    socket.emit("chat message", msg);
};

document.getElementById("form").onsubmit = sendMessage;

socket.on("chat message", msg => {
    const li = document.createElement("li");
    document.getElementById("messages").appendChild(li.appendChild(document.createTextNode(msg)));
});
