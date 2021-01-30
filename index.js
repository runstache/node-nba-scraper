const boxscoreHelper = require('./boxscoreHelper.js');
const scoreboadHelper = require('./scoreboardHelper.js');
const teamHelper = require('./teamHelper.js');

const gameDate = process.argv[2];
const outputDirectory = '/mnt/c/data/json/nba/';

scoreboadHelper.loadScoreData('20210124', processScoreboard);

async function processScoreboard(scoreboard) {
  if (scoreboard) {
    var i;
    for (i = 0; i < scoreboard.length; i++) {
      var item = scoreboard[i];
      await buildItem(item);
    }
  } else {
    console.log('NO SCOREBOARD FOUND FOR GAME DATE: ' + gameDate);
  }
}

async function buildItem(item) {
  var gamestats = {};
  gamestats.id = item.id;
  gamestats.game = item;

  boxscoreHelper.loadBoxScore(item.id).then((result) => {
    gamestats.awayPlayers = boxscoreHelper.getAwayPlayerStats(result);
    gamestats.homePlayers = boxscoreHelper.getHomePlayerStats(result);
  }).catch((err) => console.log('FAILED TO BUILD BOXSCORE: ' + err))
  .then(() => teamHelper.loadTeamStats(item.id).then((teamHtml) => {    
    gamestats.teams = teamHelper.buildTeamTotals(teamHtml, item.id);
  })).catch((err) => console.log('FAILED TO LOAD TEAMS: ' + err))
  .then(() => writeToFile(gamestats, item.id));
}

function writeToFile(result, id) {
  const fs = require('fs');
  var fileName = outputDirectory + id + '.json';
  console.log('WRITING TO FILE: ' + id);
  fs.writeFile(fileName, JSON.stringify(result), (err) => {
    if (err) {
      console.log(err);
    }
  });
}
