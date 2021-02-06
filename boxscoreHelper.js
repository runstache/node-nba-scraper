const client = require('axios');
const cheerio = require('cheerio');
const htmlHelper = require('./htmlHelper.js');

async function loadBoxScore(gameId) {
  const { data } = await client.get('https://www.espn.com/nba/boxscore?gameId=' + gameId);
  const boxscoreHtml = htmlHelper.getHtml(data, '#gamepackage-box-score');
  return boxscoreHtml;
}

async function getAwayPlayerStats(boxscoreHtml) {

  try {
    var awayBoxScore = htmlHelper.getHtml(boxscoreHtml, 'div.gamepackage-away-wrap');
    var awayplayerStats = htmlHelper.getHtml(awayBoxScore, 'table.mod-data');
    var players = [];
    players = await getPlayerStats(awayplayerStats, 'away');
    return players;
  } catch (err) {
    console.log('Error Pulling Away Player Stats');
    return [];
  }

}

async function getHomePlayerStats(boxscoreHtml) {
  try {
    var homeBoxScore = htmlHelper.getHtml(boxscoreHtml, 'div.gamepackage-home-wrap');
    var homePlayerStats = htmlHelper.getHtml(homeBoxScore, 'table.mod-data');
    var players = [];
    players = await getPlayerStats(homePlayerStats, 'home');
    return players;
  } catch (err) {
    console.log('Error Pulling Home player Stats');
    return [];
  }

}

async function getPlayerStats(playerStats, type) {
  const $ = cheerio.load(playerStats, {
    xmlMode: true
  });

  var players = [];

  $('tbody').each(function (i, el) {

    try {
      var htmlString = $(this).html();
      const r = cheerio.load(htmlString, { xmlMode: true });
      r('tr:not(.highlight)').each(function (idx, row) {
        var playerRow = r(this).html();
        var player = buildPlayer(playerRow);
        player.team = type;
        players.push(player);
      });

    } catch (err) {
      console.log('REQUESTED SECTION NOT FOUND ON PAGE:' + err);
    }
  });
  return players;
}

function buildPlayer(playerHtml) {
  try {
    var stats = [];
    var player = {};
    var position = htmlHelper.getValue(playerHtml, 'span.position');
    var name = htmlHelper.getValue(playerHtml, 'span.abbr');
    var playerUrl = htmlHelper.getAttributeValue(playerHtml, 'a', 'href');
    player.name = name;
    player.position = position;
    player.fullUrl = playerUrl;
    player.stats = stats;

    const $ = cheerio.load(playerHtml, {
      xmlMode: true
    });

    $('td').each(function (idx, column) {

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
  } catch (err) {
    console.log('Error Building Player');
    return {};
  }
}

exports.getHomePlayerStats = getHomePlayerStats;
exports.getAwayPlayerStats = getAwayPlayerStats;
exports.loadBoxScore = loadBoxScore;

