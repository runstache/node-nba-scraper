const client = require('axios');
const cheerio = require('cheerio');
const htmlHelper = require('./htmlHelper.js');


async function loadBoxScore(gameId) {
  const { data } = await client.get('https://www.espn.com/nba/boxscore?gameId=' + gameId);
  const boxscoreHtml = htmlHelper.getHtml(data, '#gamepackage-box-score');
  return boxscoreHtml;  
}

function getAwayPlayerStats(boxscoreHtml) {

  var awayBoxScore = htmlHelper.getHtml(boxscoreHtml, 'div.gamepackage-away-wrap');
  var awayplayerStats = htmlHelper.getHtml(awayBoxScore, 'table.mod-data');
  var players = [];
  players = getPlayerStats(awayplayerStats, 'away');
  return players;

}

function getHomePlayerStats(boxscoreHtml) {
  var homeBoxScore = htmlHelper.getHtml(boxscoreHtml, 'div.gamepackage-home-wrap');
  var homePlayerStats = htmlHelper.getHtml(homeBoxScore, 'table.mod-data');
  var players = [];
  players = getPlayerStats(homePlayerStats, 'home');
  return players;
}

function getPlayerStats(playerStats, type) {
  const $ = cheerio.load(playerStats, {
    xmlMode: true
  });

  var players = [];

  $('tbody').each(function(i, el) {    
    
    try {      
      var htmlString = $(this).html();
      const r = cheerio.load(htmlString, {xmlMode: true});
      r('tr:not(.highlight)').each(function(idx, row){
        var playerRow = r(this).html();
        var player = buildPlayer(playerRow);
        player.team = type;
        players.push(player);
      });
    } catch(err) {
      console.log('REQUESTED SECTION NOT FOUND ON PAGE:' + err);
    }
    
    
  });
  return players;
}

function buildPlayer(playerHtml) {
  var stats = [];
  var player = {};
  var position = htmlHelper.getValue(playerHtml, 'span.position');
  var name = htmlHelper.getValue(playerHtml, 'span.abbr');

  player.name = name;
  player.position = position;
  player.stats = stats;

  const $ = cheerio.load(playerHtml, {
    xmlMode: true
  });

  $('td').each(function(idx, column) {
    
    var atttributeName = column.attribs.class;
    if (atttributeName != 'name') {
      var stat = {};
      var columnHtml = $(this).html();
      stat.name = atttributeName;
      stat.value = columnHtml;
      stats.push(stat);
    }
    
  });
  return player;
}

exports.getHomePlayerStats = getHomePlayerStats;
exports.getAwayPlayerStats = getAwayPlayerStats;
exports.loadBoxScore = loadBoxScore;

