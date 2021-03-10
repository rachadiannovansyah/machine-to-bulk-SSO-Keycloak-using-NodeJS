var express = require('express'); 
var app = express(); 
var bodyParser = require('body-parser');

app.use(bodyParser.json());  

/** API path that will upload the files */
require('./setup/routes')(app);

app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

app.listen('8000', function(){
    console.log('running on 8000...');
});