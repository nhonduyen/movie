var async = require('async');
var mysql = require('mysql');
var request = require('request');
var fs = require('fs');

var pool  = mysql.createPool({
	connectionLimit : 100,
	host        	: 'localhost',
	user        	: 'root',
	password    	: '',
	database    	: 'datamovies',
	multipleStatements: true
});

function processDb() {
	let seft = this;
	seft.collectMovies();
}

processDb.prototype.collectMovies = function() {
	let seft = this;
	let movies = JSON.parse(fs.readFileSync('inputJson.json', 'utf8'));
	
	async.eachSeries(movies,seft.processMovie, function() {
		console.log('Done');
	});
}

processDb.prototype.processMovie = function(movies, callback) {
	let seft = this;
	async.waterfall([
		function(callback) {
			console.log('request', movies.name);
			request({
				url: 'https://moviesapi.com/m.php?t='+movies.name+'&y=&type=movie&r=json',
				json: true
			}, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					if (typeof body[0] != null && typeof body[0] != 'undefined') {
						callback(null, body[0], movies.name);
					}
					else {
						console.log('Movie not found');
						callback(true);
					}
				}
				else{
					console.log('Error', error);
					callback(true);
				}
			});
			
		},
		function(MovieResponse, Movie, callback) {
			let checkExist = 'SELECT ID FROM ?? WHERE ??=? LIMIT 1';
			let checkQuery = ["movie","id", MovieResponse.id];
			checkExist = mysql.format(checkExist, checkQuery);
			pool.getConnection(function(err, connection) {
				if (err) {
					seft.stop(err);
					return ;
				}
				connection.query(checkExist, function(err, rows) {
					connection.destroy();
					if (err) console.log('Error running query', err);
					else if (rows[0]) { console.log('Movie existed with id', MovieResponse.id); callback(null,MovieResponse, true);}
					else callback(null, MovieResponse, false);
				});
			});
			
		},
		function(MovieResponse, flag, callback) {
			console.log(MovieResponse);
			if (!flag) {
				let sql = 'INSERT INTO ?? (??,??,??,??,??) VALUES (?,?,?,?,?)';
				let inserts  = ["movie","ID","Name","Year","Poster","Type",
				MovieResponse.id,MovieResponse.title,MovieResponse.year,MovieResponse.poster,MovieResponse.type];
				sql = mysql.format(sql, inserts);

				pool.getConnection(function(err, connection) {
					if (err) {
						seft.stop(err);
						return ;
					}
					connection.query(sql, function(err, rows) {
						connection.destroy();
						if (err) console.log('Error running query', err);
						else console.log('Inserted movies ', MovieResponse.title);
					});
					callback();
				});
			}
			else callback();
		}
		], function() { callback(); });
} 

processDb.prototype.stop = function (err) {
	console.log('Issue with mysql', err);
	process.exit(1);
}

new processDb();