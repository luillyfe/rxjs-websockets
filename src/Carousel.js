export const setTopic = event => {
    subject.next(event.target.innerText);
};

export const setCardInfo = (
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