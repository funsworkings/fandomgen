// client-side js, loaded by index.html
// run by the browser each time the page is loaded
console.log("hello world :o");

import { init as init_renderer, animate as init_animate, import_mesh, import_avatar } from "./scene.js";

/* * * * * * * * * * * * * * * * * * * */

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

/* * * * * * * * * * * * * * * * * * * */

const AVATAR_COUNT = 640;



var DOM_avatar_profile;
var DOM_avatar_name;
var DOM_avatar_location;
var DOM_avatar_icon;
var DOM_avatar_gallery;
var DOM_avatar_backdrop;
var DOM_avatar_scene;

var DOM_threejs_renderer;

var fetchAvatar = function()
{
  $.get("random_avatar", function(data, status){
    
    var avatar = JSON.parse(data); // parse out avatar object
    console.log("received => " + data);
    
    DOM_avatar_icon.setAttribute('src', avatar.thumbnail);
    DOM_avatar_name.innerHTML = avatar.info.name;
    DOM_avatar_location.innerHTML = avatar.info.game;
    
    var assets = avatar.images;
    for(var i = 0; i < assets.length; i++){
      var path = "";
      
      var asset = assets[i];
      path = asset;
      if(!asset.includes("http"))
        path = "./tmp/" + asset;
        
      
      if(i == 0)
        DOM_avatar_backdrop.style.backgroundImage = `url(${path}`;
      else {
        var el = document.createElement("IMG");
        
        el.src = path;
        el.className = "avatar-item";

        DOM_avatar_gallery.appendChild(el);
      }
    }
    
    import_avatar(avatar);

    assets = avatar.meshes;
    var materials = avatar.materials;

    for(var i = 0; i < assets.length; i++){
      var mesh = assets[i];
      var path = "";
      
      var material = null;
      if(i < materials.length) 
      {
        material = materials[i];
        if(!material.includes("http"))
          material = "./tmp/" + material;
      }
      
      path = mesh;
      if(!mesh.includes("http"))
        path = "./tmp/" + mesh;

      import_mesh(path, material);
    }
    
    if(DOM_avatar_profile)
      DOM_avatar_profile.style = "visibility: visible !important";
  });
}


window.addEventListener('load', (event) => 
{
  DOM_avatar_profile = document.getElementById("avatar-items");
  if(DOM_avatar_profile)
    DOM_avatar_profile.style = "visibility: hidden";
  
  DOM_avatar_icon = document.getElementById("avatar-icon");
  DOM_avatar_name = document.getElementById("avatar-name");
  DOM_avatar_location = document.getElementById("avatar-location");
  DOM_avatar_gallery = document.getElementById("gallery");
  DOM_avatar_backdrop = document.getElementById("avatar-backdrop");
  DOM_avatar_scene = document.getElementById("avatar-scene");

  DOM_threejs_renderer = init_renderer(DOM_avatar_scene);
  DOM_avatar_scene.appendChild(DOM_threejs_renderer); // Insert renderer

  fetchAvatar();
});


export { Avatar, Avatar_Info };