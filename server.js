require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

const alp = "abcdefghijklmnopqrstuvwxyz".split("");

function randomGen(){
  var ret = "";
  for (var i=0; i<6; i++){
    if (Math.floor(Math.random()*2))
      ret += '' + alp[Math.floor(Math.random()*alp.length)];
    else
      ret += '' + Math.floor(Math.random()*10);
  }return ret;
}

const urlScheme = new mongoose.Schema({
  url: String,
  shortURL: String
})

let ShortURL = mongoose.model('ShortURL', urlScheme);

app.post("/api/shorturl", (req,res)=>{
  var url = req.body.url;
  if (validateUrl(url)){
    ShortURL.findOne({url: url}, (err,data)=>{
      if (!data){
        var su = randomGen();
        ShortURL.create({url: url, shortURL: su}, (err,data)=>{
          res.send({original_url: url, short_url: su});
        })
      }else{
        res.send({original_url: url, short_url: data.shortURL});
      }
    })   
  }else{
    res.send({ error: 'invalid url' });
  }
});

app.post("/api/shorturl/redirect", (req,res)=>{
  //console.log("POST");
  ShortURL.findOne({shortURL: req.body.url}, (err,data)=>{
    if (data) res.redirect(data.url);
    else res.send({"error":"No short URL found for the given input"});
  });
});

app.get("/api/shorturl/:url", (req,res)=>{
  //console.log("GET");
  ShortURL.findOne({shortURL: req.params.url}, (err,data)=>{
    if (data) res.redirect(data.url);
    else res.send({"error":"No short URL found for the given input"});
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
