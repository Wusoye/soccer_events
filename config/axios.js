const { stringify } = require("nodemon/lib/utils");

var axios = require("axios").default;

module.exports = function () {
    this.getPlayersByFixture = (params, callback) => {
        var options = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures/players',
            params: { fixture: params },
            headers: {
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
                'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
            }
        };

        axios.request(options).then(function (response) {
            callback(response.data)
        }).catch(function (error) {
            console.error(error);
        });
    }

    this.getPrdictionsByFixture = (params, callback) => {
        var options = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/predictions',
            params: { fixture: params },
            headers: {
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
                'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
            }
        };

        axios.request(options).then(function (response) {
            callback(response.data)
        }).catch(function (error) {
            console.error(error);
        });
    }

    this.getTeamStatistics = (league, season, team, cb) => {
        const options = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/teams/statistics',
            params: {league: String(league), season: String(season), team: String(team)},
            headers: {
              'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
              'X-RapidAPI-Key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
            }
          };
          
          axios.request(options).then(function (response) {
              cb(response.data)
          }).catch(function (error) {
              console.error(error);
          });
    }
    //WITH STATISTICS
    this.getPlayersByTeam = (team, season, callback) => {
        var options = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/players',
            params: { team: team, season: season },
            headers: {
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
                'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
            }
        };

        axios.request(options).then(function (response) {
            //console.log(response.data);
            callback(response.data)
        }).catch(function (error) {
            console.error(error);
        });
    }

    this.getLeagues = (callback) => {
        var options = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/leagues',
            params: { current: 'true' },
            headers: {
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
                'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
            }
        };

        axios.request(options).then(function (response) {
            callback(response.data);
        }).catch(function (error) {
            console.error(error);
        });
    }

    this.getTopScorers = (league_id, season, callback) => {
        var options = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/players/topscorers',
            params: { league: league_id, season: season },
            headers: {
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
                'x-rapidapi-key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
            }
        };

        axios.request(options).then(function (response) {
            callback(response.data);
        }).catch(function (error) {
            console.error(error);
        });
    }

    this.getLastFixturesByTeam = (idTeam, nbFixtures, cb) => {
        const options = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v2/fixtures/team/' + idTeam + '/last/' + nbFixtures + '',
            params: { timezone: 'Europe/London' },
            headers: {
                'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
                'X-RapidAPI-Key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0'
            }
        };

        axios.request(options).then(function (response) {
            cb(response.data)
        }).catch(function (error) {
            cb(error)
        });
    }
}