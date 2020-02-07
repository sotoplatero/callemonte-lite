import fetch from "node-fetch"
var cheerio = require('cheerio');
var cleaner = require('./libs/cleaner');

const rePhone = /((5|7)\d{7})|((24|32|33|45)\d{6})/g;

exports.handler =  async (event, context, callback) => {
    const { q, p = 1, pmin = 1, pmax = '' } = event.queryStringParameters;

    const response = await fetch(`https://www.revolico.com/search.html?q=${q}&min_price=${pmin}&max_price=${pmax}&p=${p}`);
    const body = await response.text();
    const $ = cheerio.load( body );

    let json = JSON.parse( $('script[type="application/json"]').get()[0].children[0].data );

    // retorna el listado 
    let data = Object.keys( json.props.apolloState )
        .filter( k => /^AdType/.test(k) )
        .map( k => {
            let ad = json.props.apolloState[k]

            return {
                id: ad.id,
                title: cleaner(ad.title),
                phones: ad.title.replace(/\W/g,'').match(rePhone) || [],
                price: ad.price,
                url: 'https://www.revolico.com'  + ad.permalink,
                photo: parseInt(ad.imagesCount) > 0,
            }
        } )

    return {
        headers: { 
            'Content-Type':'application/json' , 
            'Access-Control-Allow-Origin': '*'
        },
        statusCode: 200,
        body: JSON.stringify(data)
    };

} // revolico
