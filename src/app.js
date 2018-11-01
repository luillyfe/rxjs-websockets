import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import 'babel-polyfill';
import { webSocket } from "rxjs/webSocket";
import { from } from "rxjs";
import { map } from "rxjs/operators";
import { setCardInfo, setTopic } from "./Carousel";


const getURl = () => {
    return from(fetch("https://jsonplaceholder.typicode.com/posts"))
        .pipe(
            map(() => "ws://localhost:3200")
        );
};
const initWs = async () => {
    let wsSubject = () => null;
    await getURl().forEach(url => wsSubject = webSocket(url));

    wsSubject.subscribe(response => {
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
};

initWs();