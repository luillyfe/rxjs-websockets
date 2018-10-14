import { webSocket } from "rxjs/webSocket";

const subject = webSocket("ws://localhost:3200");

subject.subscribe(res => {
    if (res.state === "ok") {
        console.log(`Connection ${res.state}`);
    } else {
        console.log(res)
    }
});