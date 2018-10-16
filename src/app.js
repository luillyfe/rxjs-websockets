import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { webSocket } from "rxjs/webSocket";
import { map } from "rxjs/operators";

const WebSocketSubject = webSocket("ws://localhost:3200");


const setTopic = (event = {target: {innerText: "Technology"}}) => {
    WebSocketSubject.next(JSON.stringify(event.target.innerText));
};
const brokenImg = event => {
    event.target.attr('src', 'https://via.placeholder.com/350x150');
}

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

const news = WebSocketSubject.multiplex(
    () => JSON.stringify({subscribe: "news"}),
    () => JSON.stringify({unsubscribe: "news"}),
    message => message.type === "news"
).pipe(map(message => JSON.parse(message.articles)));

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

news.subscribe(articles => {
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

chat.subscribe(message => console.log(`Comming from Chat channel, ${message}`));