import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { webSocket } from "rxjs/webSocket";
import io from "socket.io-client";
import { setCarouselInfo } from "./carousel";

const wsSubjectConfig = {
    url: "ws://localhost:3200",
    WebSocketCtor: io
};
const wsSubject = webSocket(wsSubjectConfig);
const setTopic = event => {
    wsSubject._socket.emit("topic", event.target.innerText);
};

wsSubject.subscribe();
wsSubject._socket.on("articles", articles => {
    if (articles && articles.length >= 3) {
        setCarouselInfo(articles);
    } else {
        console.log("It looks like there is not more content related to this topic. We switched the topic.");
        setTopic();
    }
});



/**
 * init
 * */
const topics = document.querySelector(".list-group.list-group-flush");
topics.addEventListener("click", setTopic);
