import { webSocket } from "rxjs/webSocket";

const sendMessage = evt => {
    evt.preventDefault();
    // const msg = evt.target.children[0].value;
    // socket.emit("chat message", msg);
};

document.getElementById("form").onsubmit = sendMessage;

const subject = webSocket("ws://localhost:3200");
subject.subscribe(res => {
    if (res.state === "ok") {
        subject.next(JSON.stringify({message: "some message"}));
    } else {
        console.log(res)
    }
});