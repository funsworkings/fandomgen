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
const etl = require("etl");
const request = require("superagent");
const { on } = require("process");
const cors = require("cors");
const dotenv = require('dotenv').config();


const PORT = process.env.PORT;

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

  this.images = [];
  this.meshes = [];
  this.materials = [];
};

Avatar.prototype.isvalid = function()
{
  return this.name && this.name != "";
}

Avatar.prototype.query_name = function(){
  var name = this.info.name;
  if(name) 
     return convert_to_query(name);
  
  return null;
}

Avatar.prototype.query_game = function(){
  var game = this.info.game;
  if(game) 
     return convert_to_query(game);
  
  return null;
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

function convert_to_query(str){
  var arr = str.split('');
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
   return result;
}


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.static("js"));
app.use(express.static("node_modules"));
app.use('/lib', express.static("lib"));
app.use('/tmp', express.static("tmp"));

app.use(cors()); // CORS ERR BYPASS

async function fetchHTML(url) {
  console.log("fetch= " + url);

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
        
          await read_avatar(avatar);
          resolve(avatar);
      });
      
  }
    
  });
}

async function read_avatar(avatar)
{
  var images = [];
  var meshes = [];
  var materials = [];

  return new Promise(async (resolve, reject) => 
  {
    var write_queue = [];

    fs.createReadStream(__dirname + '/tmp/avi.zip')
      .pipe(unzip.Parse())
      .pipe(etl.map( entry => 
      {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        const size = entry.vars.uncompressedSize; // There is also compressedSize;
        
        if(type == 'File')
        {
          var path_s = fileName.split('\/');
          var path = path_s[path_s.length-1];

          if(fileName.includes(".png") || fileName.includes(".jpg"))
          {
            console.log("img= " + path);
            images.push(path);
          }
          else if(fileName.includes(".obj") || fileName.includes(".dae") || fileName.includes(".fbx"))
          {
            console.log("mesh= " + path);
            meshes.push(path);
          }
          else if(fileName.includes(".mtl"))
          {
            console.log("mat= " + path);
            materials.push(path);
          }

          return entry
            .pipe(etl.toFile(__dirname + '/tmp/' + path))
            .promise();
        }
        else
          entry.autodrain();

      }))
      .on('finish', () => 
      {
        console.log('done');

        avatar.images = images;
        avatar.meshes = meshes;
        avatar.materials = materials;
        
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
  });
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

async function scrape_wiki(wiki, avatar)
{
  var $ = await fetchHTML(wiki);
  const search_game = avatar.query_name();
  
  var gamepedia = wiki.includes("gamepedia");
  var query = wiki + `wiki/Special:Search?search=${search_game}&fulltext=Search&scope=internal&ns6=1&filters%5B%5D=is_image#`;
  
  if(gamepedia)
  {
    query = wiki + `/index.php?search=${search_game}&title=Special%3ASearch&profile=images&fulltext=1`;
    $ = await fetchHTML(query);
    
    var results = $('.search-results')
    .find($('.searchresultImage'))
    .find($('img')).each((i, el) => {
      var src = $(el).attr('src');
      console.log('gamepedia src= ' + src);
    });
  }
  else //Fandom
  {
    console.log("scrape wiki= " + query);
    $ = await fetchHTML(query);
    
    var results = $('.Results').first();
    if(results){
      var _results = $(results).find($('.result'))
      .find($('.thumbimage')).each((i, el) => {
          var src = $(el).attr('src');
        
          var push = false;
          var ind = -1;
          
          ind = src.indexOf(".png");
          if(ind > -1)
          {
             push = true;
          }
          else
          {
            ind = src.indexOf(".jpg");
            if(ind > -1)
              push = true;
          }
        
          if(push)
          {
            src = src.substr(0, ind+4); // Append extension
            
            console.log('fandom src= ' + src);
            avatar.images.push(src);
          }
      });
    }
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
    console.log('try');
  
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
      console.log("found wiki= " + wiki_url);
      
      if(wiki_url)
      {
        var assets = await scrape_wiki(wiki_url, avatar);
        
      }
    }
  
    const payload = JSON.stringify(avatar);
    console.log(payload);
  
    response.send(payload);
});



// listen for requests :)
const listener = app.listen(PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
