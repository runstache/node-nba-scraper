const boxscoreHelper = require('./boxscoreHelper.js');
const scoreboadHelper = require('./scoreboardHelper.js');
const teamHelper = require('./teamHelper.js');
const playerHelper = require('./playerHelper.js');

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
    boxscoreHelper.getHomePlayerStats(result)
      .then((homePlayers) => fixNames(homePlayers).then((home) => gamestats.homePlayers = home))
      .then(() => boxscoreHelper.getAwayPlayerStats(result).then((awayPlayers) => fixNames(awayPlayers).then((away) => gamestats.awayPlayers = away)))
      .then(() => teamHelper.loadTeamStats(item.id).then((teamHtml) => teamHelper.buildTeamTotals(teamHtml, item.id).then((teamStats) => gamestats.teams = teamStats)))
      .then(() => writeToFile(gamestats, item.id));
  });
}

async function fixNames(players) {
  var i;
  for (i = 0; i < players.length; i++) {
    var player = {};
    player = players[i];
    if (player.fullUrl) {
      player.fullName = await playerHelper.getPlayerName(player.fullUrl);
    }
    players[i] = player;
  }
  return players;
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
