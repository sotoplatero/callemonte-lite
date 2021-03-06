const fetch = require("node-fetch");
var cheerio = require('cheerio');
var cleaner = require('./libs/cleaner');
const moment = require('moment')
const { reRepetition } = require('./libs/vars')
var Sugar = require('sugar');
require('sugar/locales/es.js');
Sugar.Date.setLocale('es');
const rePhone = /(\+?53)?\s?([1-9][\s-]?){1}(\d[\s-]?){7}/g;

exports.handler =  async (event, context, callback) => {
    var { q, p = 1, pmin = 1, pmax = '', province = 'www' } = event.queryStringParameters;
    province = province==='' ? 'cuba' : province

    const response = await fetch(`https://${province}.porlalivre.com/search/?q=${q}&page=${p}&price_min=${pmin}&price_max=${pmax}`);
    const body = await response.text();
    const $ = cheerio.load( body );
    moment.locale('es')
    let data = $('div.classified-wrapper').map( (i,el) => {
        let $el = $(el), 
            $a = $el.find('a.classified-link'),
            reId = /([A-Z0-9]+)\/$/,
            $price = $el.find('#price2'),
            date = Sugar.Date.create( $el.find('ul.media-bottom li').first().text() )
            
        return {
            price:  $el.find('#price2').text().replace(/\D/g,''),
            title:  cleaner( $el.find('.media-heading').children().remove().end().text() ),
            url: 'https://porlalivre.com' + $el.find('a.classified-link').attr('href'),
            description: $el.find('.media-body > span').text().trim().replace(reRepetition, '$1'),
            date: Sugar.Date.format(date, '%b %e %R'),
            location: $el.find('ul.media-bottom li').eq(1).text().trim(),
            // photo:  /no_image/g.test( $el.find('.media-object').attr('src') ) ? '' : 'https://porlalivre.com'+$el.find('img.media-object').attr('src'),
            // phones:  $el.find('.media-heading').text().replace(/\W/g,'').match(rePhone) || [],
        };

    }).get();

    return {
        headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin': '*' },
        statusCode: 200,
        body: JSON.stringify(data)
    };

} // revolico
