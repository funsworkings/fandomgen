// client-side js, loaded by index.html
// run by the browser each time the page is loaded
console.log("hello world :o");


const AVATAR_COUNT = 640;


var DOM_gallery;

window.addEventListener('load', (event) => 
{
  return;
  
  DOM_gallery = document.getElementById("gallery");
  for(var i = 0; i < AVATAR_COUNT; i++)
    addAvatar();
});


var addAvatar = function()
{
  $.get("random_avatar", function(data, status){
    
    if(!DOM_gallery)
      return;
    
    console.log("received = " + data);
    var el = document.createElement("IMG");
    el.src = data;
    el.className = "avatar-item";
    
    DOM_gallery.appendChild(el);
  });
}
