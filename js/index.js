// client-side js, loaded by index.html
// run by the browser each time the page is loaded
console.log("hello world :o");

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
};

/* * * * * * * * * * * * * * * * * * * */

const AVATAR_COUNT = 640;


var DOM_gallery;

var DOM_avatar_name;
var DOM_avatar_location;
var DOM_avatar_icon;


var fetchAvatar = function()
{
  $.get("random_avatar", function(data, status){
    
    var avatar = JSON.parse(data); // parse out avatar object
    console.log("received => " + data);
    
    DOM_avatar_icon.setAttribute('src', avatar.thumbnail);
    DOM_avatar_name.innerHTML = avatar.info.name;
    DOM_avatar_location.innerHTML = avatar.info.game;
    
   // var el = document.createElement("IMG");
     // el.src = data;
      //el.className = "avatar-item";
    
    
    
    //DOM_gallery.appendChild(el);
  });
}


window.addEventListener('load', (event) => 
{
  DOM_gallery = document.getElementById("gallery");
  
  DOM_avatar_icon = document.getElementById("avatar-icon");
  DOM_avatar_name = document.getElementById("avatar-name");
  DOM_avatar_location = document.getElementById("avatar-location");
  
  fetchAvatar();
});
