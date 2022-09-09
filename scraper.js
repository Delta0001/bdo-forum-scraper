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

// promises = [
//                 scrapeForum(url+1, getIDSelector(1)),
//                 scrapeForum(url+1, getPostSelector(2)),
//                 scrapeForum(url+1, getIDSelector(2)),
//                 scrapeForum(url+1, getPostSelector(2)),
//                 scrapeForum(url+1, getIDSelector(3)),
//                 scrapeForum(url+1, getPostSelector(3)),
//                 scrapeForum(url+1, getIDSelector(4)),
//                 scrapeForum(url+1, getPostSelector(4)),
//                 scrapeForum(url+1, getIDSelector(5)),
//                 scrapeForum(url+1, getPostSelector(5)),
//                 scrapeForum(url+1, getIDSelector(5)),
//                 scrapeForum(url+1, getPostSelector(5)),
//                 scrapeForum(url+1, getIDSelector(6)),
//                 scrapeForum(url+1, getPostSelector(6)),
//                 scrapeForum(url+1, getIDSelector(7)),
//                 scrapeForum(url+1, getPostSelector(7)),
//                 scrapeForum(url+1, getIDSelector(8)),
//                 scrapeForum(url+1, getPostSelector(8)),
//                 scrapeForum(url+1, getIDSelector(9)),
//                 scrapeForum(url+1, getPostSelector(9)),
//                 scrapeForum(url+1, getIDSelector(10)),
//                 scrapeForum(url+1, getPostSelector(10)),
//             ]

promises = []

let maxPages = 1
let maxPosts = 10
for (let page = 1; page <= maxPages; page++) {
    for (let post = 1; post <= maxPosts; post++) {
        promises.push( scrapeForum(url+page, getIDSelector(post)) )
        promises.push( scrapeForum(url+page, getPostSelector(post)) )
    }
}

Promise.all(promises).then(value => console.log(value))



// value = scrapeForum(url+1, getIDSelector(1))
// console.log(value)

// function getValues() {
//     value = scrapeForum(url+1, getIDSelector(1))
//     console.log(value)
//     // scrapeForum(url+1, getPostSelector(1))
//     // console.log("======")
//     // scrapeForum(url+1, getIDSelector(2))
//     // scrapeForum(url+1, getPostSelector(2))
//     // console.log("======")
//     // scrapeForum(url+1, getIDSelector(3))
//     // scrapeForum(url+1, getPostSelector(3))
// }
// getValues()