var express = require('express');
var app = express();

var axios = require("axios").default;
var bodyParser = require('body-parser');
var csv = require("csvtojson");
const request = require('request')
var moment = require('./config/moment');

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

//--- 

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
    res.render('event_detail', { idMatch: id, items: response.data.data, infos: response.data.event, coteFte: coteFte, coteBe: coteBe, goals_predictions: goals_predictions, elo_inc: elo_inc, header: 'Event Detail' });
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/event_detail/:id', function (req, res) {
  id = req.params.id;
  whoWin = parseInt(req.body.whoWin);

  //coteBe = [req.body.coteBe1, req.body.coteBeX, req.body.coteBe2];
  //coteFte = [req.body.cote1, req.body.coteX, req.body.cote2];


  goals_predictions = [req.body.local_goal, req.body.visitor_goal];
  tilt = [req.body.local_tilt, req.body.visitor_tilt];
  elo_inc = [req.body.local_inc, req.body.visitor_inc];

  local_goals = goals_predictions[0]
  visitor_goals = goals_predictions[1]

  local_goals_nT = goals_predictions[0] * (1 + elo_inc[0] / 100)
  visitor_goals_nT = goals_predictions[1] * (1 + elo_inc[1] / 100)

  console.log(local_goals_nT, visitor_goals_nT);

  //local_goals_no_tilt = goals_predictions[0] / (1 + tilt[0] / 100)
  //visitor_goals_no_tilt = goals_predictions[1] / (1 + tilt[1] / 100)

  //local_goals_inc = local_goals_no_tilt * (1 + elo_inc[0] / 100)
  //visitor_goals_inc = visitor_goals_no_tilt * (1 + elo_inc[1] / 100)

  normal_distrib = new distrib_poisson(local_goals, visitor_goals, 15)
  normal_proba = normal_distrib.predict_proba(false);
  //normal_distrib.show_distrib()

  inc_distrib = new distrib_poisson(local_goals_nT, visitor_goals_nT, 15)
  inc_proba = inc_distrib.predict_proba(false);

  //console.log(normal_proba, inc_proba);

  coteBe = [normal_proba[0], normal_proba[1], normal_proba[2]];
  coteFte = [inc_proba[0], inc_proba[1], inc_proba[2]];



  model_prob = null;

  var options = {
    method: 'GET',
    url: 'https://www.oddsmath.com/api/v1/live-odds.json/?event_id=' + id + '&cat_id=0&include_exchanges=1&language=en&country_code=FR'
  };

  axios.request(options).then(function (response) {
    //console.log(response.data),
    res.render('event_detail', { idMatch: id, items: response.data.data, infos: response.data.event, coteFte: coteFte, coteBe: coteBe, goals_predictions: goals_predictions, elo_inc: elo_inc, header: 'Event Detail' });
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

  local_goals = goals_predictions[0]
  visitor_goals = goals_predictions[1]

  //local_goals_nT = goals_predictions[0] / (1 + tilt[0] / 100)
  //visitor_goals_nT = goals_predictions[1] / (1 + tilt[1] / 100)

  local_goals_nT = tilt[0]
  visitor_goals_nT = tilt[1]

  local_goals_inc = goals_predictions[0] * (1 + elo_inc[0] / 100)
  visitor_goals_inc = goals_predictions[1] * (1 + elo_inc[1] / 100)

  console.log('----------')

  normal_distrib = new distrib_poisson(local_goals, visitor_goals, 25)
  normal_proba = normal_distrib.predict_proba(false);
  console.log(normal_proba);

  no_tilt_distrib = new distrib_poisson(local_goals_nT, visitor_goals_nT, 25)
  no_tilt_proba = no_tilt_distrib.predict_proba(false);
  console.log(no_tilt_proba); 

  inc_distrib = new distrib_poisson(local_goals_inc, visitor_goals_inc, 15)
  inc_proba = inc_distrib.predict_proba(false);

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
      jsonObj.forEach(element => {


        if (infos_event.home_name == element.team1 && infos_event.away_name == element.team2 && infos_event.date_event == element.date) {
          select_event = element;
        }
        if (moment(infos_event.date_event) > moment(element.date)) {
          if (infos_event.home_name == element.team1 || infos_event.home_name == element.team2){
            last_event_home.push(element)

            if (infos_event.home_name == element.team1) {
              detail_home_obj = JSON.parse('{"proj_score1":"'+ element.proj_score1 +'", "score1":"'+ element.score1 +'", "xg1":"'+ element.xg1 +'"}')
              detail_home.push(detail_home_obj)
            } else if (infos_event.home_name == element.team2) {
              detail_home_obj = JSON.parse('{"proj_score1":"'+ element.proj_score2 +'", "score1":"'+ element.score2 +'", "xg1":"'+ element.xg2 +'"}')
              detail_home.push(detail_home_obj)
            }

          }
          if (infos_event.away_name == element.team2 || infos_event.away_name == element.team1){
            last_event_away.push(element)

            if (infos_event.away_name == element.team1) {
              detail_away_obj = JSON.parse('{"proj_score2":"'+ element.proj_score1 +'", "score2":"'+ element.score1 +'", "xg2":"'+ element.xg1 +'"}')
              detail_away.push(detail_away_obj)
            } else if (infos_event.away_name == element.team2) {
              detail_away_obj = JSON.parse('{"proj_score2":"'+ element.proj_score2 +'", "score2":"'+ element.score2 +'", "xg2":"'+ element.xg2 +'"}')
              detail_away.push(detail_away_obj)
            }

          }
        }
      })

      last_event = [last_event_home.reverse(), last_event_away.reverse()]
      last_detail = [detail_home.reverse(), detail_away.reverse()]

      res.render('five_soccer_event', { last_detail: last_detail, select_event: select_event, last_event: last_event, header: ''+home_name+' - '+away_name+'' });
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

  local_goals = xG[0]
  visitor_goals = xG[1]

  //local_goals_inc = elo_inc[0]
  //visitor_goals_inc = elo_inc[1]

  local_goals_inc = xG[0] / (1 + tilt[0] / 100)
  visitor_goals_inc = xG[1] / (1 + tilt[1] / 100)

  normal_distrib = new distrib_poisson(local_goals, visitor_goals, 15)
  normal_proba = normal_distrib.predict_proba(false);
  //normal_distrib.show_distrib()

  inc_distrib = new distrib_poisson(local_goals_inc, visitor_goals_inc, 15)
  inc_proba = inc_distrib.predict_proba(false);

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

app.get('/predictions_by_fixture/:id/:dateISO', function (req, res) {
  my_id = req.params.id;
  dateISO = req.params.dateISO;
  var options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/predictions',
    params: { fixture: my_id },
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
    }
  };

  axios.request(options).then(function (response_1) {
    res.render('predictions_by_fixture', { id_fixture: my_id, dateISO: dateISO, data_pred: response_1.data.response[0], header: 'Prédiction' });
  }).catch(function (error) {
    console.error(error);
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

app.listen(40);