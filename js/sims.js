import { getRandomInt } from './helpers.js';

var first_names = [
  "doug",
  "karen",
  "bill",
  "jonah",
  "charlie",
  "lionel",
  "rex",
  "susan",
  "leslie",
  "nina",
  "tina"
];

var last_names = [
  "werther",
  "chaplin",
  "appleseed",
  "yu",
  "douglas",
  "fang",
  "smith",
  "westwood",
  "moonshine"
];

var Sim = function()
{
  var first_name = "Jeff";
  var last_name = "Bezos";
  var sex = 1.0;
  var age = 56;
  var occupation = "CEO";
  
  var hobbies = [];
  var loves = [];
  var fears = [];
}

Sim.prototype.randomize = function()
{
  this.first_name = first_names[getRandomInt(first_names.length)];
  this.last_name = last_names[getRandomInt(last_names.length)];
}

Sim.prototype.print = function()
{
  console.log(this.first_name + " " + this.last_name);
}



module.exports = { Sim };