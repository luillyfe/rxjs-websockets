import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { webSocket } from "rxjs/webSocket";
import { map } from "rxjs/operators";
import { fromEvent } from "rxjs";
import { setCarouselInfo, brokenImg } from "./carousel";


const reader = new FileReader();
const news$ = fromEvent(reader, "loadend").pipe(
    map(event => {
        const response = new TextDecoder("utf-8").decode(event.target.result);
        return JSON.parse(response).articles;
    })
);
let chunks = [];
const WebSocketSubject = webSocket({
    url: "ws://localhost:3200",
    deserializer: ({data}) => {
        if (data === "end" && chunks.length > 0) {
            reader.readAsArrayBuffer(new Blob(chunks));
            chunks = [];
            return { type: "No data" };
        } else {
            if (data && data.type === "") {
                chunks.push(data);
            } else  {
                // send data any other than Blob
                return JSON.parse(data);
            }
        }
        return { type: "No data" };
    }
});
const setTopic = (event = {target: {innerText: "Technology"}}) => {
    WebSocketSubject.next(JSON.stringify(event.target.innerText));
};

const chat$ = WebSocketSubject.multiplex(
    () => JSON.stringify({subscribe: "chat"}),
    () => JSON.stringify({unsubscribe: "chat"}),
    message => message.type === "chat"
).pipe(map(message => message.message));

/**
 * the Subject that holds the actual connection to the server. Use 'send' method
 * to communicate to the Server.
 * */
WebSocketSubject.subscribe(
    response => {
        if (response.state === "ok") {
            console.log(response.message);

            const topics = document.querySelector(".list-group.list-group-flush");
            const imgs = document.querySelector("img.card-img-top");

            topics.addEventListener("click", setTopic);
            imgs.addEventListener("onerror", brokenImg);
        }
    }, console.log, () => console.log("Websocket closed!"));

/**
 * Multiplexing creates a new Observable with this Subject as the source. Therefore
 * they does not have a 'next' method, meaning you cannot use them to communicate
 * with the server. However you still can use 'WebSocketSubject' to send messages
 * to the server and attach to it a 'type' property to indicate the Channel that
 * message belongs to.
 * */

chat$.subscribe(message => console.log(`Comming from Chat channel, ${message}`));

news$.subscribe(articles => {
    if (articles && articles.length >= 3) {
        setCarouselInfo(articles);
    } else {
        console.log("It looks like there is not more content related to this topic. We switched the topic.");
        setTopic();
    }
});