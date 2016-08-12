var http = require('http');
var path = require('path');
var fs = require('fs');
var shortid = require('shortid');

var express = require('express');
var app = express();

var mongodb = require('mongodb').MongoClient;
var dbURL = 'mongodb://' + process.env.IP + ':27017/shorturl';

var server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, 'client')));

app.get('/readme', function(req, res) {
    fs.readFile('readme.md', 'utf8', function(err, data) {
        if (err) {
            return console.log(err);
        }
        res.jsonp(data);
        res.end();
    });
});

app.get('/new/*', function(req, res) {
    var obj = {};
    if (/^\/new\/((http|https)(:\/\/www\.|:\/\/)(.*)(\.)(.*))/i.test(req.url)) {
        var uid = shortid.generate();
        obj.original = req.params[0];
        obj.new = 'https://urls-jimcalhoun.c9users.io/' + uid;
        mongodb.connect(dbURL, function(err, db) {
            if (err) {
                return console.log(err);
            }
            console.log('Connected to DB');
            var collection = db.collection('urls');
            collection.insert({
                uid: uid,
                url: obj.original
            }, function(err, data) {
                if (err) {
                    return console.log(err);
                }
            });
            db.close();
        });
    } else {
        obj = {
            error: 'Please make sure you are using the correct format and valid url.'
        };
    }
    res.end(JSON.stringify(obj));
})

app.get('/:id', function(req, res) {
    if (req.params.id != 'favicon.ico') {
        mongodb.connect(dbURL, function(err, db) {
            if (err) {
                return console.log(err);
            }
            console.log('Connected to DB');
            var collection = db.collection('urls');
            collection.find({uid: req.params.id}).toArray(function(err, data) {
                if (err) {
                    return console.log(err);
                }
                res.redirect(data[0].url);
            });
            db.close();
        });
    }
});

server.listen(8080, process.env.IP, function() {
    var addr = server.address();
    console.log('Server listening at ' + addr.address + ':' + addr.port+ '.');
});