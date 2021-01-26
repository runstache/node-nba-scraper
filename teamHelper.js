const client = require('axios');
const htmlHelper = require('./htmlHelper.js');
const cheerio = require('cheerio');

async function loadTeamStats(gameId) {
  var { data } = await client.get('https://www.espn.com/nba/matchup?gameId=' + gameId);
  var teamStatsHtml = htmlHelper.getHtml(data, '#teamstats-wrap');
  return teamStatsHtml;
}

function buildTeamTotals(teamHtml) {
  var teams = [];
  var homeTeam = {};
  var awayTeam = {};

  var statHtml = htmlHelper.getHtml(teamHtml, 'tbody');

  const $ = cheerio.load(statHtml, {
    xmlMode: true
  });
  homeTeam.type = 'home';
  homeTeam.stats = [];
  awayTeam.type = 'away';
  awayTeam.stats = [];

  $('tr').each(function(idx, el) {
    var statRow = $(this).html();
    var statName = htmlHelper.getValue(statRow, 'td', 0);
    var awayStat = htmlHelper.getValue(statRow, 'td', 1);
    var homeStat = htmlHelper.getValue(statRow, 'td', 2);

    var homeStatObject = {};
    homeStatObject.type = statName.replace(/[\s\r\n\t]/g, '');
    homeStatObject.value = homeStat.replace(/[\s\r\n\t]/g, '');
    homeTeam.stats.push(homeStatObject);

    var awayStatObject = {};
    awayStatObject.type = statName.replace(/[\s\r\n\t]/g, '');
    awayStatObject.value = awayStat.replace(/[\s\r\n\t]/g, '');
    awayTeam.stats.push(awayStatObject);
  });
  teams.push(homeTeam);
  teams.push(awayTeam);
  return teams;
}

exports.loadTeamStats = loadTeamStats;
exports.buildTeamTotals = buildTeamTotals;