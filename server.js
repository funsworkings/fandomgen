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

const Avatar_Info = function()
{
  this.name = "";
  this.game = "";
  this.section = "";
  this.filesize = "";
  this.submitter = "";
  this.format = "";
  this.hits = "";
  this.comments = "";
}

Avatar_Info.prototype.print = function(){
  console.log("name= " + this.name + "  game= " + this.game + "  filesize= " + this.filesize + "  hits=" + this.hits);
}

const Avatar = function()
{
  this.info = Object.create(Avatar_Info.prototype);
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



var MODELS_ROOT = [];


async function scrape_root() 
{
   const $ = await fetchHTML(ROOT);
   $('a').filter(function(){
     //var innerhtml = $(this).html();
     //var innerhtml_format = innerhtml.toLowerCase().replace(' ', '_');
     
     var href = $(this).attr('href');
     return (href.includes("/model/"));
   }).each(function(){
     var href = $(this).attr('href');
     MODELS_ROOT.push(href);
   });
}


function parse_avatar_info($, info_container, info){
  info_container.each((i, el) => {
      
      var html = $(el).html();
      if(html == "Game")
      {
        html = $(el).next().find($('a')).html();
        info.game = html;
      }
      else if(html == "Filesize"){
        html = $(el).next().html();
        info.filesize = html;
      }
      else if(html == "Hits"){
        html = $(el).next().html();
        info.hits = html;
      }
  });
  
  return info;
}

async function scrape_model(model)
{
  console.log("scrape = " + model);
  var PATH = ROOT + model;
  
  const $ = await fetchHTML(PATH);
  
  var information = Object.create(Avatar_Info.prototype);
  
  const info = $("#game-info-wrapper").first();
  const categories = info.find($('tr')).filter((i, el) => {
    
    var classname = $(el).attr('class');
    if(classname)
      return classname.includes('altrow');
    
    return false;
    
  }).each((i, el) => 
  {
    
    var children = $(el).find('td');
    parse_avatar_info($, children, information);
    
  });
  
  if(information) information.print();
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
    await scrape_root();
    console.log("Found " + MODELS_ROOT.length + " models in ROOT!");
  
    var model = MODELS_ROOT[random.int(0, MODELS_ROOT.length)];
    await scrape_model(model);
  
  
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
