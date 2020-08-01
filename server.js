// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const path = require("path");
const random = require("random");
const app = express();
const fs = require("fs");
const unzip = require("unzipper");
const axios = require("axios");
const cheerio = require("cheerio");
const request = require("superagent");


const ROOT = process.env.SRC_ROOT;
const PATH = ROOT + "/" + process.env.SRC_PATH;
const TMP = path.join(__dirname, "tmp");

const PATH_WIKI = "https://www.fandom.com";

var dir = './tmp'; // Setup temp directory
if (!fs.existsSync(dir))
    fs.mkdirSync(dir);
else
  wipe_temp();





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
  this.zip = "";
  this.assets = [];
};

Avatar.prototype.isvalid = function()
{
  return this.name && this.name != "";
}

Avatar.prototype.query_game = function(){
  var game = this.info.game;
  if(game) 
  {
     var arr = game.split('');
     var query = [];
    
     for(var i = 0; i < arr.length; i++)
     {
       var c = arr[i];
       var r = "";
       
       if(c == ' ')
         r += "+";
       else if(!alphanumeric(c))
         r += `%${ascii_to_hex(c)}`;
       else
         r += c;
          
       query.push(r);
     }
    
     var result = query.join('');
    console.log("result = " + result);
     return result;
  }
  
  console.log("fail");
  return "";
}

var CURRENT_AVATAR = Object.create(Avatar.prototype);



function ascii_to_hex(str)
{
    var hex = "";
    for(var i = 0; i < str.length; i++){
      hex += str.charCodeAt(i).toString(16);
    }
  
    return hex;
}

function alphanumeric(input)
{ 
  var patt = /^[a-z0-9]+$/i;
  var regex = new RegExp(patt);
  
  return regex.test(input);
}


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.static("js"));
app.use('/tmp', express.static("tmp"));

async function fetchHTML(url) {
  const { data } = await axios.get(url)
  return cheerio.load(data)
}

function wipe_temp(){
  fs.readdir(TMP, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(TMP, file), err => 
      {
          if (err) throw err;
          console.log("wipe= " + file);
      });
    }
  });
}


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

async function scrape_model(model, avatar)
{
  console.log("scrape = " + model);
  var PATH = ROOT + model;
  
  const $ = await fetchHTML(PATH);
  
  var information = Object.create(Avatar_Info.prototype);
  var thumbnail = "";
  var zipfile = "";
  
  const info = $("#game-info-wrapper").first();
  
  const name = info.find($('.rowheader')).find($('div')).filter((i, el) => {
    return $(el).attr('title');
  }).each((i, el) => {
    information.name = $(el).attr('title');
  });
  
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
  
  const icon = $('.bigiconbody').find($('img')).each((i, el) => {
    thumbnail = $(el).attr('src');
  });

  const zip = $('a').filter((i, el) => {
    var link = $(el).attr('href');
    if(link)
      return link.includes("/download/");
    
    return false;
  }).each((i, el) => {
    var link = $(el).attr('href');
    zipfile = link;
  });
  
  
  if(information) information.print();
  
  avatar.info = information;
  avatar.thumbnail = thumbnail;
  avatar.zip = zipfile;
}

function scrape_avatar(avatar) {
  
  return new Promise( async (resolve, reject) => {
  
  var zip = avatar.zip;
  if(zip && zip != ""){
    
    request
    .get(zip)
    .on('error', function(error) {
      console.log("zip err= " + error);
      reject(error);
    })
    .pipe(fs.createWriteStream(__dirname + '/tmp/avi.zip'))
    .on('finish', async function() 
    {
        console.log("complete write= " + zip);
      
        var assets = await read_avatar();
        avatar.assets = assets;
      
        resolve(avatar);
    });
      
  }
    
  });
}

async function read_avatar()
{
    var assets = [];
  
    const extract = fs.createReadStream(__dirname + '/tmp/avi.zip').pipe(unzip.Parse({forceStream: true}));
    for await (const entry of extract) {
      const fileName = entry.path;
      const type = entry.type; // 'Directory' or 'File'
      const size = entry.vars.uncompressedSize; // There is also compressedSize;
      
      if(fileName.includes(".png") || fileName.includes(".jpg"))
      {
        var path_s = fileName.split('\/');
        var path = path_s[path_s.length-1];
        
        assets.push(path);
        entry.pipe(fs.createWriteStream(__dirname + '/tmp/' + path));
        
        console.log("wrote= " + fileName);
      }
      else
        entry.autodrain();
        
      continue;
    }
    
    return assets;
}

async function fetch_wiki(avatar)
{
   var PATH = PATH_WIKI + `/?s=${avatar.query_game()}`;
   const $ = await fetchHTML(PATH);
  
   var topresult = $('.top-community-content').first();
   if(topresult)
   {
     var href = $(topresult).attr('href');
     return href;
   }
  
  return null;
}

async function scrape_wiki(wiki)
{
  const $ = await fetchHTML(wiki);
  var gamepedia = wiki.includes("gamepedia");
  
  if(gamepedia){
    
  }
}

// ROUTES!


// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => 
{
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/random_avatar", async function(request, response)
{
    wipe_temp();
  
    await scrape_root();
    console.log("Found " + MODELS_ROOT.length + " models in ROOT!");
  
    var model = MODELS_ROOT[random.int(0, MODELS_ROOT.length)];
  
    var avatar = Object.create(Avatar.prototype);
    CURRENT_AVATAR = null; // Wipe last avatar
  
    await scrape_model(model, avatar);
  
    var thumbnail = avatar.thumbnail;
    if(thumbnail != "")
      avatar.thumbnail = ROOT + thumbnail;
  
    var zip = avatar.zip;
    if(zip != "")
      avatar.zip = ROOT + zip;
  
    avatar = await scrape_avatar(avatar); // unzip contents
    CURRENT_AVATAR = avatar;
  
    if(CURRENT_AVATAR)
    {
      var wiki_url = await fetch_wiki(avatar);
      console.log(wiki_url);
    }
  
    const payload = JSON.stringify(avatar);
    console.log(payload);
  
    response.send(payload);
});



// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
