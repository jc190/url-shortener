var http = require('http');
var shortid = require('shortid');

var express = require('express');
var app = express();

var mongodb = require('mongodb').MongoClient;
var dbURL = 'mongodb://' + process.env.IP + ':27017/shorturl';

var server = http.createServer(app);

app.get(/^\/new\/((http|https)(:\/\/www\.|:\/\/)(.*)(\.)(.*))/i, function(req, res) {
    var urls = {};
    var uid = shortid.generate();
    urls.original = req.params[0];
    urls.new = 'https://urls-jimcalhoun.c9users.io/' + uid;
    res.end(JSON.stringify(urls));
    mongodb.connect(dbURL, function(err, db) {
        if (err) {
            return console.log(err);
        }
        console.log('Connected to DB');
        var collection = db.collection('urls');
        collection.insert({
            uid: uid,
            url: urls.original
        }, function(err, data) {
            if (err) {
                return console.log(err);
            }
        });
        db.close();
    });
});

app.get('/:id', function(req, res) {
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
});

// mongodb.connect(dbURL, function(err, db) {
//     if (err) {
//         return console.log(err);
//     }
//     console.log('Connected to DB');
//     var collection = db.collection('urls');
//     collection.insert({}, function(err, data) {
//         if (err) {
//             return console.log(err);
//         }
//         console.log('Data inserted to DB');
//     });
//     db.close();
// });

server.listen(8080, process.env.IP, function() {
    var addr = server.address();
    console.log('Server listening at ' + addr.address + ':' + addr.port+ '.');
});

// var testObj = {
//     uid: 'G9ju8qp',
//     url: 'http://www.google.com'
// }