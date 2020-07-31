// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.static("js"));

const _URL = process.env.SRC_URL;

var scrape_images = function()
{
  console.log(_URL);
}

async function fetchHTML(url) {
  const { data } = await axios.get(url)
  return cheerio.load(data)
}

async function scrape(){
  const $ = await fetchHTML("https://www.models-resource.com/search/?q=a*&c=2&o%5B%5D=s")

    $('img').each(function(i, element){
      var src = $(element).attr("src");
      console.log(src);
    });
  
  // Print the full HTML
  //console.log(`Site HTML: ${$.html()}\n\n`)

  // Print some specific page content
  //console.log(`First h1 tag: ${$('h1').text()}`)
}




// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => 
{
  response.sendFile(__dirname + "/views/index.html");
  scrape();
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
