// Docs
// https://nodejs.dev/en/learn/making-http-requests-with-nodejs/

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const port = 3000
const url = "https://www.naeu.playblackdesert.com/en-US/Forum/ForumTopic/Detail?_topicNo=24687&_page="

function getCountSelector(num) {
    return `#wrap > div > div.container > article > div > div > div.community_body > div.community_detail_wrap > div.detail_area.forum > div > section:nth-child(${num+1}) > div > div.contents_area.editor_area > div.contents_head > div.count`
}

function getContentSelector(num) {
    return `#wrap > div > div.container > article > div > div > div.community_body > div.community_detail_wrap > div.detail_area.forum > div > section:nth-child(${num+1}) > div > div.contents_area.editor_area > div.contents_wrap.js-quoteContentsWrap`
}

function getURL(topicId, page) {
    return `https://www.naeu.playblackdesert.com/en-US/Forum/ForumTopic/Detail?_topicNo=${topicId}&_page=${page}`
}

function scrapeForum(url, countSelector, contentSelector) {
    return axios
        .get(url)
        .then(res => {
            // console.log(`statusCode: ${res.status}`);
            let $ = cheerio.load(res.data);
            countText = $(countSelector).text().trim();
            contentText = $(contentSelector).text().trim();
            return {count: countText, content: contentText};
        })
        .catch(error => {
            console.error(error);
        });
}

async function scrapePosts(topicId, maxPages, maxPosts) {
    console.log("Collecting Data")
    promises = []

    // Create a promise for each piece of data we want to pull
    for (let page = 1; page <= maxPages; page++) {
        for (let post = 1; post <= maxPosts; post++) {
            promises.push( scrapeForum( getURL(topicId, page), getCountSelector(post), getContentSelector(post) ) );
        }
    }

    // Print result of all promises
    results = await Promise.all(promises)
        .then( (value) => {
            // console.log(value);
            return value;
        })
    console.log("Done!");
    return results
}


// Start Server
app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// example: http://localhost:3000/api/data/24687
app.get('/api/data/:topicId', async (req, res) => {
    // Scrape 1 page and 10 posts
    // data = await scrapePosts(31, 10);
    data = await scrapePosts(req.params.topicId, 1, 10);
    // res.json( data, null, 4 );
    res.header("Content-Type",'application/json');
    res.send( JSON.stringify(data, null, 4) );
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});