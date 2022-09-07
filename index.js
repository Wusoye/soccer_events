var express = require('express');
var app = express();

var axios = require("axios").default;
var midAxios = require("./config/axios");
var api = new midAxios();
var bodyParser = require('body-parser');
var csv = require("csvtojson");
const request = require('request')
var moment = require('./config/moment');

let {PythonShell} = require('python-shell')

distrib_poisson = require('./config/distrib_poisson')
inde_tilt = require('./config/inde_tilt')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.set('view engine', 'ejs');
app.locals.moment = require('./config/moment');


var client = require('./config/bd');
const { ObjectId } = require('bson');

const spawn = require('child_process').spawn;

var XMLHttpRequest = require('xhr2');
var xhr = new XMLHttpRequest();
const Papa = require("papaparse");
fs = require("fs");

header = false;

/** Function */

function numAverage(a) {
  var b = a.length,
  c = 0, i;
  for (i = 0; i < b; i++) { 
      c +=Number(a[i]); 
  } 
  return parseFloat((c/b).toFixed(2)); 
}

/** */

app.get('/', function (req, res) {
  console.log('Hello world !');
});

app.get('/math_odds_events', function (req, res) {
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/events-by-day.json/?language=en&country_code=FR&timezone=Europe%2FParis&day=today&grouping_mode=0'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('math_odds_events', { items: response.data.data, header: 'Math Odds Events' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/math_odds_events', function (req, res) {
  my_date = req.body.dateMatch;
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/events-by-day.json/?language=en&country_code=FR&timezone=Europe%2FParis&day=' + my_date + '&grouping_mode=0'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('math_odds_events', { items: response.data.data, header: 'Math Odds Events' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/event_detail/:id', function (req, res) {
  id = req.params.id;
  coteFte = [];
  coteBe = [];
  coteBasic = [];
  goals_predictions = [];
  tilt = [];
  elo_inc = [];
  model_prob = null;
  allXgs = null;
  allFormes = null;
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail', { idMatch: id, items: response.data.data, infos: response.data.event, coteFte: coteFte, coteBe: coteBe, coteBasic: coteBasic, goals_predictions: goals_predictions, elo_inc: elo_inc,allXgs: allXgs, allFormes: allFormes, header: 'Event Detail' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/event_detail/:id', function (req, res) {
  id = req.params.id;
  whoWin = parseInt(req.body.whoWin);

  //coteBe = [req.body.coteBe1, req.body.coteBeX, req.body.coteBe2];
  allFormes = req.body.all_formes
  coteBe = [allFormes.split('|')[0],allFormes.split('|')[1],allFormes.split('|')[2]]


  //coteFte = [req.body.coteBe1, req.body.coteBeX, req.body.coteBe2];

  /*
  goals_predictions = [req.body.local_goal, req.body.visitor_goal];
  tilt = [req.body.local_tilt, req.body.visitor_tilt];
  elo_inc = [req.body.local_inc, req.body.visitor_inc];
  */

  allXgs = req.body.all_xgs;
  goals_predictions = [allXgs.split('|')[0], allXgs.split('|')[1]];
  elo_inc = [allXgs.split('|')[2], allXgs.split('|')[3]];

  normal_distrib = new distrib_poisson(goals_predictions[0], goals_predictions[1], 25)
  matrice_normal = normal_distrib.predict_proba();
  normal_proba = matrice_normal['percent']

  basic_distrib = new distrib_poisson(elo_inc[0], elo_inc[1], 25)
  matrice_basic = basic_distrib.predict_proba();
  basic_proba = matrice_basic['percent']

  
  //coteBe = [normal_proba[0], normal_proba[1], normal_proba[2]];
  coteFte = [normal_proba[0], normal_proba[1], normal_proba[2]];
  coteBasic = [basic_proba[0], basic_proba[1], basic_proba[2]];




  model_prob = null;

  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail', { idMatch: id, items: response.data.data, infos: response.data.event, coteFte: coteFte, coteBe: coteBe, coteBasic: coteBasic, goals_predictions: goals_predictions, elo_inc: elo_inc, allXgs: allXgs, allFormes: allFormes, header: 'Event Detail' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/event_detail_2/:id', function (req, res) {
  id = req.params.id;
  c_normal = []; //be
  c_no_tilt = []; //fte
  c_inc = [];
  goals_predictions = [];
  tilt = [];
  elo_inc = [];
  model_prob = null;
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail_2', { idMatch: id, items: response.data.data, infos: response.data.event, c_normal: c_normal, c_no_tilt: c_no_tilt, c_inc: c_inc, goals_predictions: goals_predictions, tilt: tilt, elo_inc: elo_inc, header: 'Event Detail' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/event_detail_2/:id', function (req, res) {
  id = req.params.id;
  whoWin = parseInt(req.body.whoWin);
  
  goals_predictions = [req.body.local_goal, req.body.visitor_goal];
  tilt = [req.body.local_tilt, req.body.visitor_tilt];
  elo_inc = [req.body.local_inc, req.body.visitor_inc];
  percent_winning = [parseInt(req.body.percent_1), parseInt(req.body.percent_N), parseInt(req.body.percent_2)];

  local_goals = goals_predictions[0]
  visitor_goals = goals_predictions[1]

  local_goals_inc = elo_inc[0]
  visitor_goals_inc = elo_inc[1]

  //local_goals_inc = goals_predictions[0] * (1 + tilt[0] / 100)
  //visitor_goals_inc = goals_predictions[1] * (1 + tilt[1] / 100)

  //local_goals_nT = goals_predictions[0] / (1 + tilt[0] / 100)
  //visitor_goals_nT = goals_predictions[1] / (1 + tilt[1] / 100)

  local_goals_nT = tilt[0]
  visitor_goals_nT = tilt[1]

  normal_distrib = new distrib_poisson(local_goals, visitor_goals, 25)
  matrice_normal = normal_distrib.predict_proba();
  normal_proba = matrice_normal['percent']

  no_tilt_distrib = new distrib_poisson(local_goals_nT, visitor_goals_nT, 25)
  matrice_no_tilt = no_tilt_distrib.predict_proba();
  no_tilt_proba = matrice_no_tilt['percent']

  inc_distrib = new distrib_poisson(local_goals_inc, visitor_goals_inc, 25)
  matrice_inc = inc_distrib.predict_proba();
  inc_proba = matrice_inc['percent']
  
  
  c_normal = [normal_proba[0], normal_proba[1], normal_proba[2]];
  //c_no_tilt = [no_tilt_proba[0], no_tilt_proba[1], no_tilt_proba[2]];
  c_no_tilt = [inc_proba[0], inc_proba[1], inc_proba[2]];
  c_inc = [inc_proba[0], inc_proba[1], inc_proba[2]];
  //c_normal = [percent_winning[0], percent_winning[1], percent_winning[2]];
  
  model_prob = null;

  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail_2', { idMatch: id, items: response.data.data, infos: response.data.event, c_normal: c_normal, c_no_tilt: c_no_tilt, c_inc: c_inc, goals_predictions: goals_predictions, tilt: tilt, elo_inc: elo_inc, header: 'Event Detail' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/event_detail_3/:id', function (req, res) {
  id = req.params.id;
  c_normal = []; //be
  c_no_tilt = []; //fte
  c_inc = [];
  goals_predictions = [];
  tilt = [];
  elo_inc = [];
  model_prob = null;
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail_3', { idMatch: id, items: response.data.data, infos: response.data.event, c_normal: c_normal, c_no_tilt: c_no_tilt, c_inc: c_inc, goals_predictions: goals_predictions, tilt: tilt, elo_inc: elo_inc, header: 'Event Detail' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/event_detail_3/:id', function (req, res) {
  id = req.params.id;
  whoWin = parseInt(req.body.whoWin);
  
  goals_predictions = [req.body.local_goal, req.body.visitor_goal];
  tilt = [req.body.local_tilt, req.body.visitor_tilt];
  elo_inc = [req.body.local_inc, req.body.visitor_inc];

  local_goals = goals_predictions[0]
  visitor_goals = goals_predictions[1]

  //local_goals_nT = goals_predictions[0] / (1 + tilt[0] / 100)
  //visitor_goals_nT = goals_predictions[1] / (1 + tilt[1] / 100)

  local_goals_nT = tilt[0]
  visitor_goals_nT = tilt[1]

  //local_goals_inc = goals_predictions[0] * (1 + elo_inc[0] / 100)
  //visitor_goals_inc = goals_predictions[1] * (1 + elo_inc[1] / 100)

  local_goals_inc = elo_inc[0]
  visitor_goals_inc = elo_inc[1]

  normal_distrib = new distrib_poisson(local_goals, visitor_goals, 25)
  matrice_normal = normal_distrib.predict_proba();
  normal_proba = matrice_normal['percent']
  normal_goals_proba = matrice_normal
  //console.log(normal_proba);

  no_tilt_distrib = new distrib_poisson(local_goals_nT, visitor_goals_nT, 25)
  matrice_no_tilt = no_tilt_distrib.predict_proba();
  no_tilt_proba = matrice_no_tilt['percent']
  no_tilt_goals_proba = matrice_no_tilt
  //console.log(no_tilt_proba); 

  inc_distrib = new distrib_poisson(local_goals_inc, visitor_goals_inc, 25)
  matrice_inc = inc_distrib.predict_proba();
  inc_proba = matrice_inc['percent']
  //console.log(inc_proba); 

  c_normal = [normal_proba[0], normal_proba[1], normal_proba[2]];
  c_no_tilt = [no_tilt_proba[0], no_tilt_proba[1], no_tilt_proba[2]];
  c_inc = [inc_proba[0], inc_proba[1], inc_proba[2]];

  model_prob = null;

  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail_3', { idMatch: id, items: response.data.data, infos: response.data.event, c_normal: c_normal, c_no_tilt: c_no_tilt, c_inc: c_inc, goals_predictions: goals_predictions, tilt: tilt, elo_inc: elo_inc, normal_goals_proba: normal_goals_proba, no_tilt_goals_proba: no_tilt_goals_proba, header: 'Event Detail' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/event_detail_book/:id/:book', (req, res) => {

  id = req.params.id;
  book = req.params.book;

  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    data = response.data.data
    infos = response.data.event
    historique = data[book].history
    opening = data[book].history[historique.length - 1]

    res.render('event_detail_book', { idMatch: id, infos: infos, book: book, historique: historique, opening: opening });
  }).catch(function (error) {
    console.error(error);
  });
})

app.get('/event_detail_dc/:id', function (req, res) {
  id = req.params.id;
  coteFte = [];
  coteBe = [];
  model_prob = null;
  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=1&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail_dc', { idMatch: id, items: response.data.data, infos: response.data.event, coteFte: coteFte, coteBe: coteBe, header: 'Event Detail' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/event_detail_dc/:id', function (req, res) {
  id = req.params.id;
  whoWin = parseInt(req.body.whoWin);
  coteFte = [req.body.cote1, req.body.coteX, req.body.cote2];
  coteBe = [req.body.coteBe1, req.body.coteBeX, req.body.coteBe2];
  model_prob = null;

  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=1&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail_dc', { idMatch: id, items: response.data.data, infos: response.data.event, coteFte: coteFte, coteBe: coteBe, header: 'Event Detail' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/event_detail/KaForm/:id/:ht/:at/:dateTime/:av1/:avN/:av2/:ma1/:maN/:ma2/:mi1/:miN/:mi2', function (req, res) {
  whoWin = req.body.whoWin
  id = req.params.id

  ht = req.params.ht
  at = req.params.at
  team_match = "" + ht + " - " + at
  dateTime = req.params.dateTime

  av1 = parseFloat(req.params.av1)
  avN = parseFloat(req.params.avN)
  av2 = parseFloat(req.params.av2)

  ma1 = parseFloat(req.params.ma1)
  maN = parseFloat(req.params.maN)
  ma2 = parseFloat(req.params.ma2)

  mi1 = parseFloat(req.params.mi1)
  miN = parseFloat(req.params.miN)
  mi2 = parseFloat(req.params.mi2)

  array_drop = [[av1, avN, av2], [ma1, maN, ma2], [mi1, miN, mi2]]

  if (whoWin == 0 || whoWin == 1 || whoWin == 2) {

    client.connect(function (err) {
      const db = client.db("soccer_event");
      if (err) throw err;

      db.collection('Odds_to_BeSoccer').updateOne({ _id: ObjectId("61753aab787fca2b90bfedc3") },
        {
          $push: {
            "data":
            {
              "match": team_match,
              "Drop": array_drop,
              "date": new Date(moment(dateTime).format()),
              "winner": parseFloat(whoWin)
            }

          }

        }

        , function (err, data) {
          if (err) throw err;
          res.redirect('/event_detail/' + id);
        })
    });
  }
  else {
    res.redirect('/event_detail/' + id);
  }

})

app.post('/event_detail/addMe/:id/:ht/:at/:dateTime/:av1/:avN/:av2/:ma1/:maN/:ma2/:mi1/:miN/:mi2', function (req, res) {
  whoWin = req.body.whoWin

  ht = req.params.ht
  at = req.params.at
  team_match = "" + ht + " - " + at
  dateTime = req.params.dateTime

  av1 = parseFloat(req.params.av1)
  avN = parseFloat(req.params.avN)
  av2 = parseFloat(req.params.av2)

  ma1 = parseFloat(req.params.ma1)
  maN = parseFloat(req.params.maN)
  ma2 = parseFloat(req.params.ma2)

  mi1 = parseFloat(req.params.mi1)
  miN = parseFloat(req.params.miN)
  mi2 = parseFloat(req.params.mi2)

  array_matrice = [[av1, avN, av2], [ma1, maN, ma2], [mi1, miN, mi2]]

  if (whoWin == 0 || whoWin == 1 || whoWin == 2) {

    client.connect(function (err) {
      const db = client.db("soccer_event");
      if (err) throw err;

      db.collection('matrice_detail').updateOne({ _id: ObjectId("6160c05590577726bcfeeb49") },
        {
          $push: {
            "data":
            {
              "match": team_match,
              "matrice": array_matrice,
              "date": new Date(moment(dateTime).format()),
              "winner": parseFloat(whoWin)
            }

          }

        }

        , function (err, data) {
          if (err) throw err;
          res.redirect('/event_detail/' + id);
        })
    });
  }
  else {
    res.redirect('/event_detail/' + id);
  }

})

app.get('/event_detail/sayMe/:id/:av1/:avN/:av2/:ma1/:maN/:ma2/:mi1/:miN/:mi2/:be1/:beN/:be2', (req, res) => {
  id = req.params.id;
  coteFte = [];
  coteBe = [req.params.be1, req.params.beN, req.params.be2];

  av1 = req.params.av1.toString()
  avN = req.params.avN.toString()
  av2 = req.params.av2.toString()

  ma1 = req.params.ma1.toString()
  maN = req.params.maN.toString()
  ma2 = req.params.ma2.toString()

  mi1 = req.params.mi1.toString()
  miN = req.params.miN.toString()
  mi2 = req.params.mi2.toString()

  console.log(av1);

  const child = spawn('python', ["models/model_matrice.py", av1, avN, av2, ma1, maN, ma2, mi1, miN, mi2]);

  child.stdout.on('data', function (data) {
    prob1 = parseFloat(data.toString().split(' ')[0])
    probX = parseFloat(data.toString().split(' ')[1])
    prob2 = parseFloat(data.toString().split(' ')[2])
    model_prob = [prob1, probX, prob2]

    var options = {
      method: 'GET',
      url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
    };

    axios.request(options).then(function (response) {
      //console.log(response.data),
      res.render('event_detail', { model_prob: model_prob, idMatch: id, items: response.data.data, infos: response.data.event, coteFte: coteFte, coteBe: coteBe, header: 'Event Detail' });
    }).catch(function (error) {
      console.error(error);
    });

  });

})

//->5 30 8

app.get('/five_soccer', (req, res) => {
  const csvFilePath = './models/spi_matches_latest.csv'
  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      //console.log(jsonObj);
      res.render('five_soccer_2', { data: jsonObj.reverse(), header: 'Five Soccer 8' });
    })
});

app.get('/five_soccer_event/:home_name/:away_name/:date_event', (req, res) => {
  home_name = req.params.home_name
  away_name = req.params.away_name
  date_event = req.params.date_event
  infos_event = JSON.parse('{"home_name":"'+ String(home_name) +'", "away_name":"'+ String(away_name) +'", "date_event":"'+ String(date_event) +'"}')
  
  const csvFilePath = './models/spi_matches_latest.csv'
  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      //console.log(jsonObj);
      var select_event;
      var last_event_home = []
      var last_event_away = []
      var detail_home = []
      var detail_away = []
      var xg_home = []
      var xg_away = []
      var nsxg_home = []
      var nsxg_away = []
      var adj_home = []
      var adj_away = []
      var proj_score_home = []
      var proj_score_away = []
      var score_home = []
      var score_away = []
      jsonObj.forEach(element => {


        if (infos_event.home_name == element.team1 && infos_event.away_name == element.team2 && infos_event.date_event == element.date) {
          select_event = element;
        }
        if (moment(infos_event.date_event) > moment(element.date) && element.xg1 != '' && element.xg2 != '' ) {
          if (infos_event.home_name == element.team1 || infos_event.home_name == element.team2){
            last_event_home.push(element)

            if (infos_event.home_name == element.team1) {
              detail_home_obj = JSON.parse('{"proj_score1":"'+ element.proj_score1 +'", "score1":"'+ element.score1 +'", "xg1":"'+ element.xg1 +'"}')
              detail_home.push(detail_home_obj)
              xg_home.push(element.xg1)
              nsxg_home.push(element.nsxg1)
              adj_home.push(element.adj_score1)
              proj_score_home.push(element.proj_score1)
              score_home.push(element.score1)
              
            } else if (infos_event.home_name == element.team2) {
              detail_home_obj = JSON.parse('{"proj_score1":"'+ element.proj_score2 +'", "score1":"'+ element.score2 +'", "xg1":"'+ element.xg2 +'"}')
              detail_home.push(detail_home_obj)
              xg_home.push(element.xg2)
              nsxg_home.push(element.nsxg2)
              adj_home.push(element.adj_score2)
              proj_score_home.push(element.proj_score2)
              score_home.push(element.score2)
            }

          }
          if (infos_event.away_name == element.team2 || infos_event.away_name == element.team1){
            last_event_away.push(element)

            if (infos_event.away_name == element.team1) {
              detail_away_obj = JSON.parse('{"proj_score2":"'+ element.proj_score1 +'", "score2":"'+ element.score1 +'", "xg2":"'+ element.xg1 +'"}')
              detail_away.push(detail_away_obj)
              xg_away.push(element.xg1)
              nsxg_away.push(element.nsxg1)
              adj_away.push(element.adj_score1)
              proj_score_away.push(element.proj_score1)
              score_away.push(element.score1)
            } else if (infos_event.away_name == element.team2) {
              detail_away_obj = JSON.parse('{"proj_score2":"'+ element.proj_score2 +'", "score2":"'+ element.score2 +'", "xg2":"'+ element.xg2 +'"}')
              detail_away.push(detail_away_obj)
              xg_away.push(element.xg2)
              nsxg_away.push(element.nsxg2)
              adj_away.push(element.adj_score2)
              proj_score_away.push(element.proj_score2)
              score_away.push(element.score2)
            }
          }
        }
      })

      last_event = [last_event_home.reverse(), last_event_away.reverse()]
      last_detail = [detail_home.reverse(), detail_away.reverse()]
      last_xg = [xg_home.reverse(), xg_away.reverse()]
      last_nsxg = [nsxg_home.reverse(), nsxg_away.reverse()]
      last_adj = [adj_home.reverse(), adj_away.reverse()]
      last_proj_score = [proj_score_home.reverse(), proj_score_away.reverse()]
      last_score = [score_home.reverse(), score_away.reverse()]

      diffs_xg_proj_score_home = []
      diffs_xg_proj_score_away = []
      diffs_score_proj_score_home = []
      diffs_score_proj_score_away = []
      real_xg_home = []
      real_xg_away = []

      for (let k = 0; k < last_event[0].length; k++) {
        diffs_xg_proj_score_home.push(last_xg[0][k] - last_proj_score[0][k])
        diffs_score_proj_score_home.push(last_score[0][k] - last_proj_score[0][k])

        real_xg_home.push( numAverage( [last_xg[0][k], last_nsxg[0][k], last_adj[0][k]] ) )
      }    
      for (let k = 0; k < last_event[1].length; k++) {
        diffs_xg_proj_score_away.push(last_xg[1][k] - last_proj_score[1][k])
        diffs_score_proj_score_away.push(last_score[1][k] - last_proj_score[1][k])

        real_xg_away.push( numAverage( [last_xg[1][k], last_nsxg[1][k], last_adj[1][k]] ) )
      }  

      diffs_xg_proj_score = [diffs_xg_proj_score_home, diffs_xg_proj_score_away]
      diffs_score_proj_score = [diffs_score_proj_score_home, diffs_score_proj_score_away]
      real_xg = [real_xg_home, real_xg_away]

      res.render('five_soccer_event', { real_xg: real_xg, diffs_score_proj_score: diffs_score_proj_score, diffs_xg_proj_score: diffs_xg_proj_score, last_proj_score: last_proj_score, last_xg: last_xg, last_detail: last_detail, select_event: select_event, last_event: last_event, header: ''+home_name+' - '+away_name+'' });
    })
});

app.get('/five_soccer_3', (req, res) => {
  const csvFilePath = './models/event_today_13122021.csv'
  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      //console.log(jsonObj);
      res.render('five_soccer_3', { data: jsonObj, header: 'Five Soccer 8' });
    })
});

app.get('/five_soccer_2', (req, res) => {
  var jsonObj = []
  csv()
    .fromStream(request.get('https://projects.fivethirtyeight.com/soccer-api/club/spi_matches_latest.csv'))
    .subscribe((json) => {
      return new Promise((resolve, reject) => {
        console.log(json)
        res.render('five_soccer_2', { data: json, header: 'Five Soccer 8'});
      })

    });
});

app.get('/five_soccer_ranking', (req, res) => {
  const csvFilePath_1 = './models/spi_global_rankings.csv';
  const csvFilePath_2 = './models/spi_global_rankings_intl.csv'
  csv()
    .fromFile(csvFilePath_1)
    .then((jsonObj_1) => {

      csv()
        .fromFile(csvFilePath_2)
        .then((jsonObj_2) => {
          res.render('five_soccer_ranking', { data_club: jsonObj_1, data_intl: jsonObj_2, header: 'FS8 Ranking' });
        })
    })
});

//-> Calculator

app.get('/calculator_drop', (req, res) => {
  cote_arr = [];
  cote_dep = [];
  res.render('calculator_drop', { header: 'Calc. Drop' })
});

app.post('/calculator_drop', (req, res) => {
  cote_arr = [];
  cote_dep = [];

  cote_arr = [req.body.cote_arr_1, req.body.cote_arr_X, req.body.cote_arr_2];
  cote_dep = [req.body.cote_dep_1, req.body.cote_dep_X, req.body.cote_dep_2];



  res.render('calculator_drop', { cote_arr: cote_arr, cote_dep: cote_dep, header: 'Calc. Drop' })
});

app.get('/calculator_drop_xG', (req, res) => {
  cote_arr = [];
  cote_dep = [];
  xG = [];
  tilt = [];
  res.render('calculator_drop_xG', { header: 'Calc. Drop' })
});

app.post('/calculator_drop_xG', (req, res) => {
  cote_arr = [];
  cote_dep = [];
  xG = [];
  tilt = [];

  xG = [req.body.xG_1, req.body.xG_2];
  tilt = [req.body.tilt_1, req.body.tilt_2];

  local_goals = parseFloat(xG[0])
  visitor_goals = parseFloat(xG[1])

  tlocal_goals = parseFloat(tilt[0])
  tvisitor_goals = parseFloat(tilt[1])

  //local_goals_inc = elo_inc[0]
  //visitor_goals_inc = elo_inc[1]

  //local_goals_inc = xG[0] / (1 + tilt[0] / 100)
  //visitor_goals_inc = xG[1] / (1 + tilt[1] / 100)

  normal_distrib = new distrib_poisson(local_goals, visitor_goals, 15)
  normal_proba = normal_distrib.predict_proba()['percent'];
  

  inc_distrib = new distrib_poisson(tlocal_goals, tvisitor_goals, 15)
  inc_proba = inc_distrib.predict_proba()['percent'];
  //normal_distrib.show_distrib()

  normal_matrice = normal_distrib.predict_proba()
  console.log('------');
  Object.keys(normal_matrice).forEach(function(un_score){ 
    if (un_score != 'proba' && un_score != 'percent') { 
      score = un_score
      normal_prob_score = (normal_matrice[un_score] * 100).toFixed(2)
      console.log(score, ': ', normal_prob_score);
    }
  });

  

  //inc_distrib = new distrib_poisson(local_goals_inc, visitor_goals_inc, 15)
  //inc_proba = inc_distrib.predict_proba(false);

  cote_arr = [normal_proba[0], normal_proba[1], normal_proba[2]];
  cote_dep = [inc_proba[0], inc_proba[1], inc_proba[2]];

  

  res.render('calculator_drop_xG', { cote_arr: cote_arr, cote_dep: cote_dep, xG: xG, tilt: tilt, header: 'Calc. Drop' })
});

//-> Fixtures API

app.get('/fixtures', function (req, res) {
  my_date = moment().format("YYYY-MM-DD");
  var options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    params: { date: my_date },
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
    }
  };

  axios.request(options).then(function (response) {
    //console.log(response.data.response),
    res.render('fixtures', { data: response.data.response, header: 'Fixtures' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/fixtures', function (req, res) {
  my_date = req.body.dateMatch;
  var options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    params: { date: my_date },
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
    }
  };

  axios.request(options).then(function (response) {
    //console.log(response.data.response),
    res.render('fixtures', { data: response.data.response, header: 'Fixtures' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/predictions_by_fixture/:id/:dateISO/:idHome/:idAway/:season', async function (req, res) {
  my_id = req.params.id;
  dateISO = req.params.dateISO;
  idHome = req.params.idHome;
  idAway = req.params.idAway;
  season = req.params.season;
  //console.log(idAway, season);
  api.getPrdictionsByFixture(my_id, async (response_1) => {
    //---- catégories
    predictions = response_1.response[0]['predictions']
    league = response_1.response[0]['league']
    teams = response_1.response[0]['teams']
    comparison = response_1.response[0]['comparison']
    h2h = response_1.response[0]['h2h']

    //----  league

    id_league = league['id']
    name_league = league['name']
    country_league = league['country']
    logo_league = league['logo']
    flag_league = league['flag']
    season_league = league['season']

    //----  teams

    home_info = teams['home']
    away_info = teams['away']

    id_home = home_info['id']
    name_home = home_info['name']
    logo_home = home_info['logo']
    home_last_5 = home_info['last_5']
    home_for = home_last_5['for']

    home_xG = (home_last_5['goals']['for']['average'] / home_last_5['goals']['against']['average'])


    id_away = away_info['id']
    name_away = away_info['name']
    logo_away = away_info['logo']
    away_last_5 = away_info['last_5']
    away_xG = (away_last_5['goals']['for']['average'] / away_last_5['goals']['against']['average'])

    normal_distrib = new distrib_poisson(home_xG, away_xG, 25)
    matrice_normal = normal_distrib.predict_proba();
    proba_poisson = matrice_normal['percent'];



    api.getLastFixturesByTeam(idHome, 100, (response_local) => {
      api.getLastFixturesByTeam(idAway, 100, (response_visitor) => {

        

        function MME(tab, periode, nbmatch) {
          if (nbmatch < tab.length) {
            a = tab.length - nbmatch -1
            b = tab.length
            tab = tab.slice(a, b)
          }
          history_MME = []
          nbmatch = tab.length
          const_mme = 2 / (periode + 1)
      
          vi_ema_for_local = 0

          for (let index_2 = periode; index_2 < nbmatch; index_2++) {
              
              if (index_2 - 1 == periode) {
                  for (let index = 0; index < periode; index++) {
                      vi_ema_for_local = tab[index]['goal']
                  }
                  vi_ema_for_local = vi_ema_for_local / 2
              }
              
              vi_ema_for_local = (tab[index_2]['goal'] - vi_ema_for_local) * const_mme + vi_ema_for_local
              
              history_MME.push(vi_ema_for_local)
              mme = vi_ema_for_local

              tab[index_2] = {...tab[index_2], mme}
          }
    
          return tab
        }


        function orderData(tab, idTeam, forOrAgainst) {
          tab = tab.reverse()
          tab_2 = []
          tab.forEach(game => {
            if (game['goalsHomeTeam'] != null && game['goalsAwayTeam'] != null) {
              if (forOrAgainst) {
                if (game['homeTeam']['team_id'] == idTeam) {
                  tab_2.push({
                    'event_date': game['event_date'],
                    'goal': game['goalsHomeTeam']
                  })
                } else {
                  tab_2.push({
                    'event_date': game['event_date'],
                    'goal': game['goalsAwayTeam']
                  })
                }
              } else {
                if (game['homeTeam']['team_id'] == idTeam) {
                  tab_2.push({
                    'event_date': game['event_date'],
                    'goal': game['goalsAwayTeam']
                  })
                } else {
                  tab_2.push({
                    'event_date': game['event_date'],
                    'goal': game['goalsHomeTeam']
                  })
                }
              }           
            }
            
          })
          return tab_2
        }

        require('events').EventEmitter.prototype._maxListeners = 0;
       
        try {
          console.log(response_local['api']['results']);
          local_fixtures = response_local['api']['fixtures'];
        } catch (error) {
          
        }
        
        
        try {
          visitor_fixtures = response_visitor['api']['fixtures'];
        } catch (error) {
          
        }

        

        lfib = []
        laib = []
        vfib = []
        vaib = []

        local_fixtures.forEach(fixture => {
          if (moment(fixture['event_date']).format() < moment(dateISO).format()) {
            lfib.push(fixture)
            laib.push(fixture)
          }
        })

        visitor_fixtures.forEach(fixture => {
          if (moment(fixture['event_date']).format() < moment(dateISO).format()) {
            vfib.push(fixture)
            vaib.push(fixture)
          }
        })

        lfib = orderData(lfib, idHome, true)
        laib = orderData(laib, idHome, false)

        vfib = orderData(vfib, idAway, true)
        vaib = orderData(vaib, idAway, false)

        
        lfib_3 = MME(lfib, 3, 10)
        lfib_5 = MME(lfib, 5, 16)
        lfib_10 = MME(lfib, 10, 33)
        lfib_30 = MME(lfib, 30, 100)

        laib_3 = MME(laib, 3, 10)
        laib_5 = MME(laib, 5, 16)
        laib_10 = MME(laib, 10, 33)
        laib_30 = MME(laib, 30, 100)

        vfib_3 = MME(vfib, 3, 10)
        vfib_5 = MME(vfib, 5, 16)
        vfib_10 = MME(vfib, 10, 33)
        vfib_30 = MME(vfib, 30, 100)

        vaib_3 = MME(vaib, 3, 10)
        vaib_5 = MME(vaib, 5, 16)
        vaib_10 = MME(vaib, 10, 33)
        vaib_30 = MME(vaib, 30, 100)
        
        mmes = []

        mmes.push({lfib_3, lfib_5, lfib_10, lfib_30, laib_3, laib_5, laib_10, laib_30, vfib_3, vfib_5, vfib_10, vfib_30, vaib_3, vaib_5, vaib_10, vaib_30})

        //console.log(mmes);

        res.render('predictions_by_fixture', { id_fixture: my_id, dateISO: dateISO, data_pred: response_1.response[0], proba_poisson: proba_poisson, mmes: mmes, header: 'Prédiction' });
      })
    })
      

      
  });
});

app.post('/predictions_by_fixture/:id/:dateISO', function (req, res) { // add in BDD Mongo
  my_id = parseFloat(req.params.id);
  //console.log(my_id);
  var options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/predictions',
    params: { fixture: my_id },
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
    }
  };

  axios.request(options).then(function (response) {
    data_pred = response.data.response[0]
    dateISO = req.params.dateISO;
    winner = parseFloat(req.body.winner);

    //---- catégories
    predictions = data_pred['predictions']
    league = data_pred['league']
    teams = data_pred['teams']
    comparison = data_pred['comparison']
    h2h = data_pred['h2h']

    //----  league

    id_league = league['id']
    name_league = league['name']
    country_league = league['country']
    logo_league = league['logo']
    flag_league = league['flag']
    season_league = league['season']

    //----  teams

    home_info = teams['home']
    away_info = teams['away']

    id_home = home_info['id']
    name_home = home_info['name']
    logo_home = home_info['logo']


    id_away = away_info['id']
    name_away = away_info['name']
    logo_away = away_info['logo']

    //----  comparison

    form_comparison = comparison['form']
    home_form = parseFloat(form_comparison['home'])
    away_form = parseFloat(form_comparison['away'])

    att_comparison = comparison['att']
    home_att = parseFloat(att_comparison['home'])
    away_att = parseFloat(att_comparison['away'])

    def_comparison = comparison['def']
    home_def = parseFloat(def_comparison['home'])
    away_def = parseFloat(def_comparison['away'])

    poissond_comparison = comparison['poisson_distribution']
    home_poissond = parseFloat(poissond_comparison['home'])
    away_poissond = parseFloat(poissond_comparison['away'])

    poissond_comparison = comparison['poisson_distribution']
    home_poissond = parseFloat(poissond_comparison['home'])
    away_poissond = parseFloat(poissond_comparison['away'])

    h2h_comparison = comparison['h2h']
    home_h2h = parseFloat(h2h_comparison['home'])
    away_h2h = parseFloat(h2h_comparison['away'])

    goals_comparison = comparison['goals']
    home_goals = parseFloat(goals_comparison['home'])
    away_goals = parseFloat(goals_comparison['away'])

    total_comparison = comparison['total']
    home_total = parseFloat(total_comparison['home'])
    away_total = parseFloat(total_comparison['away'])

    //---- predictions

    winner_predictions = predictions['winner']
    id_winner = winner_predictions['id']
    name_winner = winner_predictions['name']
    comment_winner = winner_predictions['comment']

    bool_win_or_draw = predictions['win_or_draw']
    under_over = predictions['under_over']

    goals_predictions = predictions['goals']
    home_goals_pred = goals_predictions['home']
    away_goals_pred = goals_predictions['away']

    advice = predictions['advice']

    percent_predictions = predictions['percent']
    home_percent = parseFloat(percent_predictions['home'])
    draw_percent = parseFloat(percent_predictions['draw'])
    away_percent = parseFloat(percent_predictions['away'])


    client.connect(function (err) {
      const db = client.db("soccer_event");
      if (err) throw err;

      db.collection('fixtures').updateOne({ _id: ObjectId("6169bbf063242a35a44d18d4") },
        {
          $push: {
            "data":
            {
              "id_fixtures": my_id,
              "match": name_home + " - " + name_away,
              "comparaison": {
                "Home": {


                  "Form": home_form,
                  "Attack": home_att,
                  "Defense": home_def,
                  "Poisson distribution": home_poissond,
                  "Head 2 head": home_h2h,
                  "Goal": home_goals,
                  "Total": home_total


                },
                "Away": {

                  "Form": away_form,
                  "Attack": away_att,
                  "Defense": away_def,
                  "Poisson distribution": away_poissond,
                  "Head 2 head": away_h2h,
                  "Goal": away_goals,
                  "Total": away_total


                },

                "Percent winning": [home_percent, draw_percent, away_percent]
              },
              "Infos": {

                "League": name_league,
                "Country": country_league,
                "Season league": season_league

              },
              "date": new Date(dateISO),
              "winner": winner
            }

          }

        }

        , function (err, data) {
          if (err) throw err;
          console.log(name_home + " - " + name_away + ": Ajouté");
          res.redirect('/predictions_by_fixture/' + my_id + '/' + dateISO);
        })
    });

  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/show_score_odds/:id', function (req, res) {
  my_id = String(req.params.id);
  var options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/odds',
    params: { fixture: my_id, bet: '10' },
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
    }
  };

  axios.request(options).then(function (response_2) {
    console.log(response_2.data.response[0].bookmakers);
    res.render('show_score_odds', { data_book: response_2.data.response[0].bookmakers, header: 'Fixtures' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/exactScore/:id/:dateISO', (req, res) => {
  id = req.params.id
  var options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/odds',
    params: { fixture: id, bet: '10' },
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
    }
  };

  axios.request(options).then(function (response) {
    console.log(response.data.response),
      res.render('fixture_odds_score', { data: response.data.response[0] });
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/leagues', (req, res) => {
  api.getLeagues((response_leagues) => {
    //console.log(response_leagues);
    res.render('leagues', {leagues: response_leagues.response})
  })
})

app.get('/topScorer/:league_id/:season/:league_name', (req, res) => {
  league_id = req.params.league_id
  season = req.params.season
  league_name = req.params.league_name
  api.getTopScorers(league_id, season, (response_topScorers) => {
    //console.log(response_topScorers);
    res.render('topScorers', { league_name: league_name, topScorers: response_topScorers.response, header: league_name})
  })
});


//-> OddsPedia

app.get('/oddspedia_soccer_events', (req, res) => {
  var dateFin = moment().format('YYYY-MM-DD')
  var dateDebut = moment().subtract(1, 'day').format('YYYY-MM-DD')

  var options = {
    method: 'GET',
    url: 'https://oddspedia.com/api/v1/getMatchList?excludeSpecialStatus=0&sortBy=default&perPageDefault=50&startDate=' + dateDebut + 'T22%3A00%3A00Z&endDate=' + dateFin + 'T21%3A59%3A59Z&geoCode=FR&status=all&sport=football&popularLeaguesOnly=0&page=1&perPage=50&language=en'
  };

  axios.request(options).then(function (response) {

    var matchList = response.data.data.matchList;
    var categoryList = response.data.data.categoryList;
    var leagueList = response.data.data.leagueList;

    //console.log(response.data.data.matchList);
    res.render('oddspedia_soccer/oddspedia_soccer_events', { matchList: matchList, categoryList: categoryList, leagueList: leagueList, header: 'OddsPedia Events' });
  }).catch(function (error) {
    console.error(error);
  });
})

app.post('/oddspedia_soccer_events', (req, res) => {
  dateFin = req.body.dateMatch;
  dateDebut = moment(dateFin).subtract(1, 'day').format('YYYY-MM-DD')
  var options = {
    method: 'GET',
    url: 'https://oddspedia.com/api/v1/getMatchList?excludeSpecialStatus=0&sortBy=default&perPageDefault=50&startDate=' + dateDebut + 'T22%3A00%3A00Z&endDate=' + dateFin + 'T21%3A59%3A59Z&geoCode=FR&status=all&sport=football&popularLeaguesOnly=0&page=1&perPage=50&language=en'
  };

  axios.request(options).then(function (response) {

    var matchList = response.data.data.matchList;
    var categoryList = response.data.data.categoryList;
    var leagueList = response.data.data.leagueList;

    //console.log(response.data.data.matchList);
    res.render('oddspedia_soccer/oddspedia_soccer_events', { matchList: matchList, categoryList: categoryList, leagueList: leagueList, header: 'OddsPedia Events' });
  }).catch(function (error) {
    console.error(error);
  });
})

app.get('/oddspedia_soccer_detail/:id/:idInfo', (req, res) => {
  idMatch = req.params.id
  idInfo = req.params.idInfo

  coteFte = [];
  coteBe = [];

  var options = {
    method: 'GET',
    url: 'https://oddspedia.com/api/v1/getMatchOdds?wettsteuer=0&geoCode=&geoState=&matchKey=' + idInfo + '&oddGroupId=1&inplay=0&language=en'
  };

  axios.request(options).then(function (response) {

    book_offer_id = [];

    //console.log(response);

    nb_book = 0;

    data_prematch = response.data.data.prematch;
    data_prematch.forEach(element => {

      if (element.id == 1) {

        periods = element.periods;
        periods.forEach(element_2 => {
          if (element_2.ot_id == 100) {
            all_book = element_2.odds;
            all_book.forEach(each_book => {
              book_offer_id.push([each_book.bookie_name, each_book.offer_id])
            });
          }
        });
      }
    });

    nb_book = book_offer_id.length;

    moves_by_book = []

    book_offer_id.forEach(offer_id => {

      var options = {
        method: 'GET',

        url: 'https://oddspedia.com/api/v1/getOddsMovements?ot=100&matchId=' + idMatch + '&inplay=0&wettsteuer=0&geoCode=&geoState=&offerId=' + offer_id[1] + '&language=en'
      };

      axios.request(options).then(function (response_2) {

        moves_odds_1 = response_2.data.data['1'].moves;
        moves_odds_N = response_2.data.data['2'].moves;
        moves_odds_2 = response_2.data.data['3'].moves;
        moves_by_book.push([offer_id[0], moves_odds_1, moves_odds_N, moves_odds_2])

        if (nb_book == moves_by_book.length) {

          var options = {
            method: 'GET',
            url: 'https://oddspedia.com/api/v1/getMatchInfo?geoCode=FR&wettsteuer=0&matchKey=' + idInfo + '&language=en'
          };

          axios.request(options).then(function (response_3) {
            game_infos = response_3.data.data
            //console.log(game_infos);
            res.render('oddspedia_soccer/oddspedia_soccer_detail', { moves_by_book: moves_by_book, game_infos: game_infos, coteFte: coteFte, coteBe: coteBe, header: 'OddsPedia Detail' });
          }).catch(function (error) {
            console.error(error);
          });

        }// fin if()

        //res.render('', );
      }).catch(function (error) {
        console.error(error);
      });

    });

    //res.render('oddspedia_soccer_events', {matchList: matchList, categoryList: categoryList, leagueList: leagueList, header: 'OddsPedia Events'});

  }).catch(function (error) {
    console.error(error);
  });
})

app.post('/oddspedia_soccer_detail/:id/:idInfo', (req, res) => {
  idMatch = req.params.id
  idInfo = req.params.idInfo

  coteFte = [req.body.cote1, req.body.coteX, req.body.cote2];
  coteBe = [req.body.coteBe1, req.body.coteBeX, req.body.coteBe2];

  var options = {
    method: 'GET',
    url: 'https://oddspedia.com/api/v1/getMatchOdds?wettsteuer=0&geoCode=&geoState=&matchKey=' + idInfo + '&oddGroupId=1&inplay=0&language=en'
  };

  axios.request(options).then(function (response) {

    book_offer_id = [];

    //console.log(response);

    nb_book = 0;

    data_prematch = response.data.data.prematch;
    data_prematch.forEach(element => {

      if (element.id == 1) {

        periods = element.periods;
        periods.forEach(element_2 => {
          if (element_2.ot_id == 100) {
            all_book = element_2.odds;
            all_book.forEach(each_book => {
              book_offer_id.push([each_book.bookie_name, each_book.offer_id])
            });
          }
        });
      }
    });

    nb_book = book_offer_id.length;

    moves_by_book = []

    book_offer_id.forEach(offer_id => {

      var options = {
        method: 'GET',

        url: 'https://oddspedia.com/api/v1/getOddsMovements?ot=100&matchId=' + idMatch + '&inplay=0&wettsteuer=0&geoCode=&geoState=&offerId=' + offer_id[1] + '&language=en'
      };

      axios.request(options).then(function (response_2) {

        moves_odds_1 = response_2.data.data['1'].moves;
        moves_odds_N = response_2.data.data['2'].moves;
        moves_odds_2 = response_2.data.data['3'].moves;
        moves_by_book.push([offer_id[0], moves_odds_1, moves_odds_N, moves_odds_2])

        if (nb_book == moves_by_book.length) {

          var options = {
            method: 'GET',
            url: 'https://oddspedia.com/api/v1/getMatchInfo?geoCode=FR&wettsteuer=0&matchKey=' + idInfo + '&language=en'
          };

          axios.request(options).then(function (response_3) {
            game_infos = response_3.data.data
            //console.log(game_infos);
            res.render('oddspedia_soccer/oddspedia_soccer_detail', { moves_by_book: moves_by_book, game_infos: game_infos, coteFte: coteFte, coteBe: coteBe, header: 'OddsPedia Detail' });
          }).catch(function (error) {
            console.error(error);
          });

        }// fin if()

        //res.render('', );
      }).catch(function (error) {
        console.error(error);
      });

    });

    //res.render('oddspedia_soccer_events', {matchList: matchList, categoryList: categoryList, leagueList: leagueList, header: 'OddsPedia Events'});

  }).catch(function (error) {
    console.error(error);
  });
})

app.get('/miseEnForm', (req, res) => {
  fs.readFile('./models/Exemple_row_scores.json', function (erreur, fichier) {
    let rows = JSON.parse(fichier)
    console.log(rows.length);
    res.render('miseEnForm', { rows: rows })
  })
  my_distrib = new distrib_poisson(1, 1.32, 10)
  console.log(my_distrib.predict_proba());
})

//-> BESOCCER

app.get('/besoccer_xG', (req, res) => {
  const Folder = './models/BeSoccer_forme';
  const fs = require('fs');

  files = fs.readdirSync(Folder)

  res.render('besoccer_xG', {data: false, files: files, header: 'BeSoccer' })
})

app.post('/besoccer_xG/', (req, res) => {
  file = req.body.sel_file

  const csvFilePath = './models/BeSoccer_forme/'+file
  const Folder = './models/BeSoccer_forme';
  const fs = require('fs');

  files = fs.readdirSync(Folder)

  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      //console.log(jsonObj);
      res.render('besoccer_xG', { data: jsonObj, files: files, file: file, header: 'BeSoccer' });
    })
});

app.get('/besoccer', (req, res) => {
  const Folder = './models/BeSoccer';
  const fs = require('fs');

  files = fs.readdirSync(Folder)

  res.render('besoccer copy 2', {data: false, files: files, file: null, showAll: false, header: 'BeSoccer' })
})

app.post('/besoccer', (req, res) => {
  file = req.body.sel_file
  showAll = req.body.showAll == 'true';

  const csvFilePath = './models/BeSoccer/'+file
  const extPaysFile = './models/extPays.csv'
  const Folder = './models/BeSoccer';
  const fs = require('fs');

  files = fs.readdirSync(Folder)

  header = 'BeSoccer ' + moment(file.split('_BeSoccer')[0]).format('lll')

  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {

      csv()
        .fromFile(extPaysFile)
        .then((jsonExtPays) => {
          res.render('besoccer copy 2', { data: jsonObj, jsonExtPays: jsonExtPays, files: files, file: file, showAll: showAll, header: header });
        })

    })
});

app.get('/besoccer_detail/:id/:file', (req, res) => {
  id = req.params.id
  file = req.params.file

  const csvFilePath = './models/BeSoccer_forme/'+file
  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      jsonObj.forEach(element => {
        if (parseInt(element.id) == parseInt(id)) {
          local_form = element.local_form_str.split('µ').reverse()
          local_date = element.local_date_str.split('µ').reverse()
          visitor_form = element.visitor_form_str.split('µ').reverse()
          visitor_date = element.visitor_date_str.split('µ').reverse()

          local_infos = [local_date, local_form]
          visitor_infos = [visitor_date, visitor_form]
          infos = [local_infos, visitor_infos]

          data = element

          header = element.teams + '_' + element.date
        }
      })      
      res.render('besoccer_detail', { data: data, infos: infos, header: header });
    })
})


// SOFASCORE API  https://api.sofascore.com/api/v1/sport/footba/ll/scheduled-events/2021-12-07
//ACCES DENIED: Jai pas le droit voir les mails avec sofascore 08/12/2021

/*app.get('/sofEvent', (req, res) => {
  var options = {
    method: 'GET',
    url: 'https://api.sofascore.com/api/v1/sport/football/scheduled-events/2021-12-07'
  };
  axios.request(options).then(function (response) {
    console.log(response);
  }).catch(function (error) {
    console.error(error);
  });
});*/


app.get('/TEST', (req, res) => {

  function numAverage(a) {
    var b = a.length,
      c = 0, i;
    for (i = 0; i < b; i++) {
      c += Number(a[i]);
    }
    return parseFloat((c / b).toFixed(2));
  } 


  tab_l = [9, -1, -2, -2, -4]
  tab_v = [-6, -14, 2, -1, 8]
  his_l = []
  his_v = []
  nb = 5
  /*tab_l[0] = tab_l[0] * 5
  tab_l[1] = tab_l[1] * 4
  tab_l[2] = tab_l[2] * 3
  tab_l[3] = tab_l[3] * 2
  tab_l[4] = tab_l[4] * 1

  tab_v[0] = tab_v[0] * 5
  tab_v[1] = tab_v[1] * 4
  tab_v[2] = tab_v[2] * 3
  tab_v[3] = tab_v[3] * 2
  tab_v[4] = tab_v[4] * 1*/

  his_l[0] = tab_l[0]
  his_l[1] = (tab_l[0] + tab_l[1]) / 2
  his_l[2] = (tab_l[0] + tab_l[1] + tab_l[2]) / 3
  his_l[3] = (tab_l[0] + tab_l[1] + tab_l[2] + tab_l[3]) / 4
  his_l[4] = (tab_l[0] + tab_l[1] + tab_l[2] + tab_l[3] + tab_l[4]) / 5

  his_v[0] = tab_v[0]
  his_v[1] = (tab_v[0] + tab_v[1]) / 2
  his_v[2] = (tab_v[0] + tab_v[1] + tab_v[2]) / 3
  his_v[3] = (tab_v[0] + tab_v[1] + tab_v[2] + tab_v[3]) / 4
  his_v[4] = (tab_v[0] + tab_v[1] + tab_v[2] + tab_v[3] + tab_v[4]) / 5

  //console.log(numAverage(tab_l), numAverage(tab_v));
  console.log(his_l, his_v);
  console.log(numAverage(his_l), numAverage(his_v));
})


function double30(){

  let res = 0.4
  for (let i = 0; i < 30; i++) {
    res*=2
  }
  console.log(res);
}
double30()

app.listen(40);