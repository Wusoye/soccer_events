var express = require('express');
var app = express();

var axios = require("axios").default;
var bodyParser = require('body-parser');
var csv = require("csvtojson");
var moment = require('./config/moment');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.set('view engine', 'ejs');
app.locals.moment = require('./config/moment');

header = false;

//--- 

app.get('/', function (req, res) {
  console.log('Hello');
});

app.get('/fixtures', function(req, res){
  my_date = moment().format("YYYY-MM-DD");
  var options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    params: {date: my_date},
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
    }
  };
  
  axios.request(options).then(function (response) {
    //console.log(response.data.response),
    res.render('fixtures', {data: response.data.response, header: 'Fixtures'});
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/fixtures', function(req, res){
  my_date = req.body.dateMatch;
  var options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    params: {date: my_date},
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
    }
  };
  
  axios.request(options).then(function (response) {
    //console.log(response.data.response),
    res.render('fixtures', {data: response.data.response, header: 'Fixtures'});
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/predictions_by_fixture/:id', function(req, res){
  my_id = String(req.params.id);
  var options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/predictions',
    params: {fixture: my_id},
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
    }
  };
  
  axios.request(options).then(function (response_1) {   
    res.render('predictions_by_fixture', {data_pred: response_1.data.response[0], header: 'Prédiction'});
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/math_odds_events', function(req, res){
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/events-by-day.json/?language=en&country_code=FR&timezone=Europe%2FParis&day=today&grouping_mode=0'
  };
  
  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('math_odds_events', {items: response.data.data, header: 'Math Odds Events'});
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/math_odds_events', function(req, res){
  my_date = req.body.dateMatch;
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/events-by-day.json/?language=en&country_code=FR&timezone=Europe%2FParis&day='+my_date+'&grouping_mode=0'
  };
  
  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('math_odds_events', {items: response.data.data, header: 'Math Odds Events'});
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/event_detail/:id', function(req, res){
  id = req.params.id;
  coteFte = [];
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };
  
  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail', {items: response.data.data, infos: response.data.event, coteFte: coteFte, header: 'Event Detail'});
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/event_detail/:id', function(req, res){
  id = req.params.id;
  coteFte = [req.body.cote1, req.body.coteX, req.body.cote2];
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };
  
  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail', {items: response.data.data, infos: response.data.event, coteFte: coteFte, header: 'Event Detail'});
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/five_soccer', (req, res) => {
  const csvFilePath = './models/spi_matches_latest.csv'
  csv()
      .fromFile(csvFilePath)
      .then((jsonObj) => {
          //console.log(jsonObj);
          res.render('five_soccer', { data: jsonObj, header: 'Five Soccer 8'});
      })
});




app.listen(40);