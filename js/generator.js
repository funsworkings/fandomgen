import { Sim } from './sims.js';


var sims = [];

var generate = function()
{
  var sim = new Sim();
  sim.randomize();
  
  return sim;
};

var generateAll = function(amount)
{
  for(var i = 0; i < amount; i++)
  {
    var sim = generate();
    
    sims.push(sim);
    console.log("generated -> " + sim.print());
  }
}

export {}