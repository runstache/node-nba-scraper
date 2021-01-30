const client = require('axios');

async function loadScoreData(dateValue, callback) {
  const { data } = await client.get('https://www.espn.com/nba/scoreboard/_/date/' + dateValue);


  const { JSDOM, VirtualConsole } = require('jsdom');
  const virtualConsole = new VirtualConsole();

  const dom = new JSDOM(data, {
    virtualConsole,
    runScripts: "dangerously"

  });

  dom.window.onload = () => {

    var scoreData = dom.window.espn.scoreboardData;
    var events = scoreData.events;
    var i;
    var games = [];


    for (i = 0; i < events.length; i++) {

      var item = events[i];
      var competition = item.competitions[0];
      var competitors = competition.competitors;
      var game = {};

      game.id = item.id;

      var j;
      var teams = [];
      for (j = 0; j < competitors.length; j++) {
        var competitor = competitors[j];
        var competitorTeam = competitor.team;
        var team = {};
        team.name = competitorTeam.displayName;
        team.code = competitorTeam.abbreviation;
        team.type = competitor.homeAway;

        var lineScores = [];
        var scores = competitor.linescores;

        if (scores) {
          var k;
          for (k = 0; k < scores.length; k++) {
            var lineItem = scores[k];
            var line = {};
            line.quarter = k + 1;
            line.score = lineItem.value;
            lineScores.push(line);

          }
        }
        team.lineScores = lineScores;
        teams.push(team);
      }
      game.date = item.date;
      game.teams = teams;
      games.push(game);

    }
    callback(games);
  };

}

exports.loadScoreData = loadScoreData;