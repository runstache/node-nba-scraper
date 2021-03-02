const client = require('axios');
const htmlHelper = require('./htmlHelper.js');
const cheerio = require('cheerio');

var teamCode = process.argv[2];

const outputDirectory = '/mnt/c/data/json/nba/rosters/';
const rosterUrl = 'https://www.espn.com/nba/team/roster/_/name/' + teamCode;

console.log('Pulling Roster for ' + teamCode); 

getRosterPage().then(result => {

  var roster = {};
  roster.teamCode = teamCode;
  roster.players = result;

  const fs = require('fs');
  var fileName = outputDirectory  + teamCode + '.json';
  console.log('WRITING TO FILE: ' + teamCode);
  fs.writeFile(fileName, JSON.stringify(roster), (err) => {
    if (err) {
      console.log(err);
    }
  });


});


async function getRosterPage() {

  var players = [];

  const { data } = await client.get(rosterUrl, { timeout: 30000 });

  var rosterHtml = htmlHelper.getHtml(data, 'div.Team.Roster');
  
  var playerList = htmlHelper.getHtml(rosterHtml, 'tbody');

  const $ = cheerio.load(playerList, { xmlMode: true });

  $('tr').each(function (idx, el) {
    var playerRow = $(this).html();
    var playerName = htmlHelper.getValue(playerRow, 'a.AnchorLink', 1);
    players.push(playerName);
  });

  return players;


}