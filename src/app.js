import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import "babel-polyfill";
import { webSocket } from "rxjs/webSocket";
import { map } from "rxjs/operators";
import { fromEvent } from "rxjs";


const reader = new FileReader();
let chunks = [];
const news$ = fromEvent(reader, "loadend").pipe(
    map(event => {
        const response = new TextDecoder("utf-8").decode(event.target.result);
        return JSON.parse(response).articles;
    })
);
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
const brokenImg = event => {
    event.target.attr('src', 'https://via.placeholder.com/350x150');
};

const setCardInfo = (
    card = document,
    options = {
        urlToImage: "https://via.placeholder.com/350x150",
        author: "Fermin Blanco",
        content: "No content",
        url: "#"
    }) => {
    const image = card.querySelector(".card-img-top");
    const title = card.querySelector(".card-title");
    const text = card.querySelector(".card-text");
    const fullNews = card.querySelector(".full-news");

    image.src = options.urlToImage;
    title.innerText = options.author;
    text.innerText = options.content;
    fullNews.href = options.url;
};

const chat$ = WebSocketSubject.multiplex(
    () => JSON.stringify({subscribe: "chat"}),
    () => JSON.stringify({unsubscribe: "chat"}),
    message => message.type === "chat"
).pipe(map(message => message.message));


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

chat$.subscribe(message => console.log(`Comming from Chat channel, ${message}`));

news$.subscribe(articles => {
    if (articles && articles.length >= 3) {
        const carusellActive = [...Array.from(document.querySelector(".carousel-item.active").children)];
        carusellActive.forEach((card, index) => {
            const {urlToImage, author, content, url} = articles[index];
            setCardInfo(card, {urlToImage, author, content, url});
        });
    } else {
        console.log("It looks like there is not more content related to this topic. We switched the topic.");
        setTopic();
    }
});