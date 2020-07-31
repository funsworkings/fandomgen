// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const path = require("path");
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

const ROOT = process.env.SRC_ROOT;
const PATH = path.join(ROOT, process.env.SRC_PATH);

async function scrape(){
  var images = [];
  
  const $ = await fetchHTML(PATH)

    $('img').filter(function(i)
    {
      return $(this).attr("src").includes("sheet_icons");
    }).each(function(i, element){
      var src = $(element).attr("src");
      console.log(src);
      
      images.push( path.join(ROOT, src );
    });
  
  return images;
  
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

app.get("/avatar", (request, response) => 
{
    //response.sendFile()
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
