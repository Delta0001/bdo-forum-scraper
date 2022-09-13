// Docs
// https://nodejs.dev/en/learn/making-http-requests-with-nodejs/

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const fs = require('fs');

const port = 3000
const url = "https://www.naeu.playblackdesert.com/en-US/Forum/ForumTopic/Detail?_topicNo=24687&_page="

function getCountSelector(num) {
    return `#wrap > div > div.container > article > div > div > div.community_body > div.community_detail_wrap > div.detail_area.forum > div > section:nth-child(${num+1}) > div > div.contents_area.editor_area > div.contents_head > div.count`
}

function getOpinionNo(num) {
    return `#wrap > div > div.container > article > div > div > div.community_body > div.community_detail_wrap > div.detail_area.forum > div > section:nth-child(${num+1}) > div > div.contents_area.editor_area > div.contents_head > button`
}

function getContentSelector(num) {
    return `#wrap > div > div.container > article > div > div > div.community_body > div.community_detail_wrap > div.detail_area.forum > div > section:nth-child(${num+1}) > div > div.contents_area.editor_area > div.contents_wrap.js-quoteContentsWrap`
}

function createURL(topicId, opinionNo) {
    return `https://www.naeu.playblackdesert.com/en-US/Forum/ForumTopic/Detail?_topicNo=${topicId}&_opinionNo=${opinionNo}`
}

function scrapeForum(topicId, pageNum, countSelector, opinionNoSelector, contentSelector) {
    return axios
        .get(url+pageNum)
        .then( (res) => {
            // console.log(`statusCode: ${res.status}`);
            let $ = cheerio.load(res.data);
            countText = $(countSelector).text().trim();
            opinionNoText = $(opinionNoSelector).attr('data-opinionno');
            contentText = $(contentSelector).text().trim();
            return {count: countText, url: createURL(topicId, opinionNoText), content: contentText};
        })
        .catch( (error) => {
            console.error(error);
        });
}

async function scrapePosts(topicId, maxPages, maxPosts) {
    console.log("Collecting Data")
    promises = []

    // Create a promise for each piece of data we want to pull
    for (let page = 1; page <= maxPages; page++) {
        for (let post = 1; post <= maxPosts; post++) {
            promises.push( scrapeForum( topicId, page, getCountSelector(post), getOpinionNo(post), getContentSelector(post) ) );
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

// Server and Routing
app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/cache', express.static('public'))

// example: /api/data/24687
app.get('/api/data/:topicId', async (req, res) => {
    // Scrape 1 page and 10 posts
    // data = await scrapePosts(req.params.topicId, 9, 10);
    data = await scrapePosts(req.params.topicId, 41, 10);
    jsonData = JSON.stringify(data, null, 4);
    res.header("Content-Type",'application/json');
    res.send( jsonData );
    fs.writeFile(`public/${req.params.topicId}.json`, jsonData, (err) => {
        if (err)
            console.error("err")
        } );
});

// Filters out all data with data.content that doesn't contain the filter term
function filterClassTerm(json, className) {
    // Any post with "class" and "<className>" (case insensitive) with 1 to 30 other characters in between
    searchRegex = `(class).{1,30}(${className})`
    filteredData = [];
    // loop through each data. If one of the filter terms doesn't exists, skip this data and continue
    for (i in json) {
        if (! json[i].content.toLowerCase().match(searchRegex) ) {
            continue;
        }
        filteredData.push(json[i])
    }
    return filteredData;
}

// Serves a CACHED version of /api/data with the classname filtered from the list
// example: /api/cachedFilterClass/24687?class=ranger
app.get('/api/cachedFilterClass/:topicId', (req, res) => {
    axios
        .get(`http://localhost:3000/cache/${req.params.topicId}.json`)
        .then( (response) => {
            res.header("Content-Type",'application/json');
            res.send( JSON.stringify(filterClassTerm(response.data, [req.query.class]), null, 4) );
        } );
});

// Serves the LATEST version of /api/data with the classname filtered from the list
// example: /api/filterClass/24687?class=ranger
app.get('/api/filterClass/:topicId', (req, res) => {
    axios
        .get("http://localhost:3000/api/data/"+req.params.topicId)
        .then( (response) => {
            res.header("Content-Type",'application/json');
            res.send( JSON.stringify(filterClassTerm(response.data, [req.query.class]), null, 4) );
        } );
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});