const cheerio = require('cheerio');

function getHtml(htmlString, selector) {
  const $ = cheerio.load(htmlString);
  return $(selector).html();
}

function getValue(htmlString, selector, iteration) {
  if (!iteration) {
    iteration = 0;
  }

  const $ = cheerio.load(htmlString, {
    xmlMode: true
  });
  var value = $(selector).eq(iteration);
  return value.text();
}

function getAttributeValue(htmlString, selector, attribute) {
  const $ = cheerio.load(htmlString, {
    xmlMode: true
  });
  var value = $(selector).attr(attribute);
  return value;
}

exports.getHtml = getHtml;
exports.getValue = getValue;
exports.getAttributeValue = getAttributeValue;
