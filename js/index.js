// client-side js, loaded by index.html
// run by the browser each time the page is loaded
console.log("hello world :o");


const AVATAR_COUNT = 640;


var DOM_gallery;

var DOM_avatar_name;
var DOM_avatar_location;
var DOM_avatar_icon;


var fetchAvatar = function()
{
  $.get("random_avatar", function(data, status){
    
    console.log("received = " + data);
    DOM_avatar_icon.setAttribute('src', data);
    
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
  
//for(var i = 0; i < AVATAR_COUNT; i++)
  //  addAvatar();
  fetchAvatar();
});
