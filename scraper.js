// Docs
// https://nodejs.dev/en/learn/making-http-requests-with-nodejs/

const axios = require('axios');
const cheerio = require('cheerio');
const url = "https://www.naeu.playblackdesert.com/en-US/Forum/ForumTopic/Detail?_topicNo=24687&_page="

function getIDSelector(num) {
    return `#wrap > div > div.container > article > div > div > div.community_body > div.community_detail_wrap > div.detail_area.forum > div > section:nth-child(${num+1}) > div > div.contents_area.editor_area > div.contents_head > div.count`
}

function getPostSelector(num) {
    return `#wrap > div > div.container > article > div > div > div.community_body > div.community_detail_wrap > div.detail_area.forum > div > section:nth-child(${num+1}) > div > div.contents_area.editor_area > div.contents_wrap.js-quoteContentsWrap`
}

function scrapeForum(url, selector) {
    return axios
        .get(url)
        .then(res => {
            // console.log(`statusCode: ${res.status}`);
            let $ = cheerio.load(res.data);
            value = $(selector).text();
            // console.log(value);
            return value;
        })
        .catch(error => {
            console.error(error);
        });
}

promises = []

let maxPages = 17
let maxPosts = 10
for (let page = 1; page <= maxPages; page++) {
    for (let post = 1; post <= maxPosts; post++) {
        promises.push( scrapeForum(url+page, getIDSelector(post)) )
        promises.push( scrapeForum(url+page, getPostSelector(post)) )
    }
}

Promise.all(promises)
        .then( (value) => {
            console.log(value.toString().trim()+'\r=================')
        })
    

