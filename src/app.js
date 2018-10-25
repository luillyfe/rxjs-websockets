import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { webSocket } from "rxjs/webSocket";

const subject = webSocket("ws://localhost:3200");


const setTopic = event => {
    subject.next(event.target.innerText);
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

subject.subscribe(response => {
    if (response.state === "ok") {
        console.log(`Connection ${response.state}`);

        const topics = document.querySelector(".list-group.list-group-flush");
        topics.addEventListener("click", setTopic);
    } else {
        if (response.length >= 3) {
            const carusellActive = [...Array.from(document.querySelector(".carousel-item.active").children)];
            carusellActive.forEach((card, index) => {
                const {urlToImage, author, content, url} = response[index];
                setCardInfo(card, {urlToImage, author, content, url});
            });
        } else {
            console.log("We are having problems getting the news, please try again later!");
        }
    }
});