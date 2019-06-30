const express           = require('express');
const http              = require('http');
const path              = require('path');
const bodyParser        = require('body-parser');
const morgan            = require('morgan');
const app               = express();

const checkParams       = require('./routes/checkParams');
const scrape        	= require('./routes/scrape');

process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config');
config = require('config');
connection              = undefined;

app.set('port', config.get('port'));
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get('/', (req, res) => {
    res.send("Welcome To Scrapping");
});

app.get('/scrape/reviews', checkParams.isScrapeReviewsValid, scrape.scrapeReviews);

let httpServer = http.createServer(app).listen(app.get('port'), () => {
    console.log('Server listening on port ' + app.get('port'));
});

process.on("message", message => {
    console.log("Received signal: " + message);
    if (message === 'shutdown') {
        httpServer.close();
        setTimeout(() => {
            process.exit(0);
        }, 15000);
    }
});


process.on("uncaughtException", error => {
    console.error((new Date()).toUTCString() + " uncaughtException: " + error.message);
    console.error(error.stack);
});
