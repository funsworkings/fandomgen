// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const path = require("path");
const random = require("random");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");


var avatars = [];


const Avatar = function()
{
  this.name = "";
  this.game = "";
  this.section = "";
  this.filesize = -1;
  this.submitter = "";
  this.format = "";
  this.hits = -1;
  this.comments = -1;
  
  this.thumbnail = "";
};


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.static("js"));

async function fetchHTML(url) {
  const { data } = await axios.get(url)
  return cheerio.load(data)
}

const ROOT = process.env.SRC_ROOT;
const PATH = ROOT + "/" + process.env.SRC_PATH;



var CONSOLES = [];


async function scrape_consoles() 
{
  console.log("SCRAPE CONSOLES!");
  
   const $ = await fetchHTML(ROOT);
   $('a').filter(function(){
     var innerhtml = $(this).html();
     var innerhtml_format = innerhtml.toLowerCase().replace(' ', '_');
     
     var href = $(this).attr('href');
     console.log(href);
     
     return (innerhtml_format == href);
   }).each(function(){
     var href = $(this).attr('href');
     console.log(href);
   });
}


async function scrape(){
  
  avatars = []; // wipe avatars on scrape
  
  const $ = await fetchHTML(PATH);

  $('img').filter(function(i)
  {
    return $(this).attr("src").includes("sheet_icons");
  }).each(function(i, element){
    var src = $(element).attr("src");
    //console.log(src);

    avatars.push(ROOT + src);
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
});

app.get("/random_avatar", async function(request, response)
{
    await scrape_consoles();
    response.send("");
    return;
  
    if(avatars.length == 0)
    await scrape();
    
    var ind = random.int(0, avatars.length);
    var avi = avatars[ind];
  
    console.log("sent = " + avi);
    response.send(avi);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
