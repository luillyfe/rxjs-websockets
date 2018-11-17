import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { webSocket } from "rxjs/webSocket";
import { setCarouselInfo } from "./carousel";

const subject = webSocket({
    url: "ws://localhost:3200",
    openObserver: {
        next: () => {
            const topics = document.querySelector(".list-group.list-group-flush");
            topics.addEventListener("click", setTopic);
        }
    },
});


const setTopic = event => {
    event = (event && event.target) ? event : "google";
    subject.next(event.target.innerText);
};


subject
    .subscribe(articles => {
        if (articles.length >= 3) {
            setCarouselInfo(articles);
        } else {
            console.log("We are having problems getting the news, please try again later!");
            setTopic();
        }
    });