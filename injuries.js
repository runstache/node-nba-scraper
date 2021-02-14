const client = require('axios');
const htmlHelper = require('./htmlHelper.js');
const cheerio = require('cheerio');
const fs = require('fs');
  

var injuryUrl = 'https://www.espn.com/nba/injuries';
const outputDirectory = '/mnt/c/data/json/nba/injuries/';

client.get(injuryUrl, { timeout: 30000 }).then(({data}) => {
  
  var injuryContainer = htmlHelper.getHtml(data, 'div.page-container.cf');
  var injuryCard = htmlHelper.getHtml(injuryContainer, 'div.Card__Content');

  if (injuryCard) {

    const $ = cheerio.load(injuryCard, { xmlMode: true});
    var injuries = [];
    $('div.Table__league-injuries').each((idx, element) => {
      var injuryHtml = $(element).html();
      
      var titleHtml = htmlHelper.getHtml(injuryHtml, 'div.Table__Title');
      var teamName = htmlHelper.getValue(titleHtml, 'span.injuries__teamName', 0);

      var team = {};
      team.name = teamName;

      var players = [];

      var injuryBody = htmlHelper.getHtml(injuryHtml, 'tbody.Table__TBODY');

      const body = cheerio.load(injuryBody, {xmlMode:true});

      body('tr').each((index, row) => {
        var injury = {};
        var rowHtml = body(row).html();

        injury.playerName = htmlHelper.getValue(rowHtml, 'a.AnchorLink');
        injury.date = htmlHelper.getValue(rowHtml, 'td.col-date');
        injury.position = htmlHelper.getValue(rowHtml, 'td.col-pos');        
        injury.status = htmlHelper.getValue(rowHtml, 'span.TextStatus');
        injury.description = htmlHelper.getValue(rowHtml, 'td.col-desc');
        players.push(injury);
      });          
      team.injuries = players
      injuries.push(team);
    });
  } else {
    console.log('NO CARD WRAPPER');
  }
  console.log('WRITING INJURIES TO FILE');
  fs.writeFile(outputDirectory + 'injuries.json', JSON.stringify(injuries), (err) => {
    if (err) {
      console.log(err);
    }
  })  


});

