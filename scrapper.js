const client = require('axios');
const helper = require('./boxscoreHelper.js');


/*
async function loadScoreData(callback) {
  const { data } = await client.get('https://www.espn.com/nba/player/_/id/3988/danny-green');
  callback(data);
}



loadScoreData(function(result) {
  const fs = require('fs');
  var filename = 'player.html';
  console.log('WRITING TO FILE: ' + filename);
  fs.writeFile(filename, result, function(err) {
    if (err) {
      console.log(err);
    }
  });
});
*/

const playerHelper = require('./playerHelper.js');

//playerHelper.getPlayerName('https://www.espn.com/nba/player/_/id/3988/danny-green').then((result) => console.log(result));

helper.loadBoxScore('401267448').then((result) => {
  var stats = [];
  stats = helper.getAwayPlayerStats(result);
  
  setFullName(stats).then((results) => {
    console.log(results);
  });  
});

async function setFullName(players) {
  var i;
  var newStats = [];
  for (i = 0; i < players.length; i++) {
    var player = players[i];
    var fullName = await playerHelper.getPlayerName(player.fullUrl);
    player.fullName = fullName;
    newStats.push(player);
  }
  return newStats;
}

