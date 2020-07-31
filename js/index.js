// client-side js, loaded by index.html
// run by the browser each time the page is loaded
console.log("hello world :o");

window.addEventListener('load', (event) => 
{
  console.log("tried");
  $.get("random_avatar", function(data, status){
    console.log(data);
  });
});
