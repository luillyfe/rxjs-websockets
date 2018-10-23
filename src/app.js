import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import "babel-polyfill";
import { webSocket } from "rxjs/webSocket";
import { map } from "rxjs/operators";
import { Subject, concat } from "rxjs";

const blobSubject = new Subject(), reader = new FileReader();
const blobMessages$ = blobSubject.asObservable();
let chunks = [];
reader.onloadend = event => {
    const response = new TextDecoder("utf-8").decode(event.target.result);
    const message = { type: "Blob", articles: JSON.parse(response).articles };
    blobSubject.next(message);
};

function deserializer (msg) {
    if (msg.data === "end" && chunks.length > 0) {
        reader.readAsArrayBuffer(new Blob(chunks));
        chunks = [];
        return { type: "Blob", articles: [] };
    } else {
        if (msg.data && msg.data.type === "") {
            chunks.push(msg.data);
        } else  {
            return JSON.parse(msg.data);
        }
    }
    return { type: "error" };
}
const WebSocketSubject = webSocket({
    url: "ws://localhost:3200",
    deserializer
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

const chat = WebSocketSubject.multiplex(
    () => JSON.stringify({subscribe: "chat"}),
    () => JSON.stringify({unsubscribe: "chat"}),
    message => message.type === "chat"
).pipe(map(message => message.message));

const binary = WebSocketSubject.multiplex(
    () => JSON.stringify({subscribe: "Blob"}),
    () => JSON.stringify({unsubscribe: "Blob"}),
    message => message.type === "Blob"
).pipe(
    map(message => {
        if (message.articles && message.articles.length > 0) {
            return message.articles;
        }
        return { message: "No data!" };
    })
);
blobMessages$.pipe(
    map(message => {
        if (message.articles && message.articles.length > 0) {
            return message.articles;
        }
        return { message: "No data!" };
    })
);
const news = concat(blobMessages$, binary);


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

chat.subscribe(message => console.log(`Comming from Chat channel, ${message}`));

news.subscribe(({articles}) => {
    if (articles.length >= 3) {
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