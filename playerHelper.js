const client = require('axios');
const htmlHelper = require('./htmlHelper.js');
const cheerio = require('cheerio');


async function getPlayerName(playerUrl) {
  var { data } = await client.get(playerUrl, { timeout: 30000 });

  var nameHtml = htmlHelper.getHtml(data, 'h1.PlayerHeader__Name');
  nameHtml = '<div>' + nameHtml + '</div>';
  const $ = cheerio.load(nameHtml, {xmlMode: true});

  var player = '';

  $('span.min-w-0').each((idx, element) => {
    var spanValue = $(element).text();

    player += spanValue + ' ';
  });
  return player.trim();
}

exports.getPlayerName = getPlayerName;
