var express = require('express');
var mongo = require('mongodb').MongoClient;
var app = express();
var url = 'mongodb://user:password@ds021761.mlab.com:21761/shorturl';
var validUrl = require('valid-url');
var sequence = 0;
var original_url = 'https://cryptic-reef-58313.herokuapp.com/';
app.set('port', (process.env.PORT || 5000));

app.use(express.static('public'));

mongo.connect(url,function(err,db){
  if(err){
    throw err;
  }else{
    console.log("Connected to db");
  }
  var Urls = db.collection('urls');

  app.get('/', function(request, response) {
    response.render(index.html);
  });

  app.get('/new/*',function(request,response){
    var req_url = request.path.replace('/new/','');
    if(!validUrl.isUri(url)){
      response.json({Error : "URL Invalid"});
    }else{
      if(Urls.findOne({"original_url":req_url})){
        Urls.find({"original_url":req_url}).limit(1).toArray(function(err,doc){
          delete doc[0]['_id'];
          response.send(doc);
        });
      }else{
        sequence++;
        Urls.insertOne({"original_url":req_url, "short_url":original_url+sequence});
        response.json({"original_url":req_url, "short_url":original_url+sequence});
        response.end();
      }
    }
});

  app.get('/*',function(request,response){
    var num = request.path.replace('/','');
    console.log(num);
    Urls.find({"short_url":original_url+num}).limit(1).toArray(function(err,docs){
      if(err){
        response.json({Error : "URL Invalid"});
        throw err;
      }else{
        console.log(docs);
        response.redirect(docs[0].original_url);
      }
    });
  });

  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });
});
