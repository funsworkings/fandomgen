// client-side js, loaded by index.html
// run by the browser each time the page is loaded

import generateAll from './generator.js';

console.log("hello world :o");

window.addEventListener('load', (event) => 
{
  console.log('page is fully loaded');
  
  generateAll();
});
