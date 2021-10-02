'use strict';
var express = require('express');
var app = express();
var multer  =   require('multer');
var putURL = 'http://localhost:8000';

var filePath ;

var upload = multer({ dest: '../uploads/' })

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'))
app.set('port', (process.env.PORT || 8000));

app.get('/', function (req, res) {
    res.render('home');
});
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});


app.post('/profile', upload.single('avatar'), function (req, res, next) {
  console.log("GET PATH ---> ",req.file)
  res.render('goback');
  filePath= req.file.path;
  app.use(function (req, res, next) {
    curlFileUpload(res);
});

function curlFileUpload(res ) {
    var curlCommand;
    curlCommand = 'curl -X PUT --upload-file "'+filePath+'" "'+putURL+'"';
    var exec = require('child_process').exec;
    var child = exec(curlCommand);
    res.end("done");
    var contents = '';
    child.stdout.on('data', function(data) {
        contents += data;
        res.end("done");
    });
    child.stderr.on('data', function(data) {
        console.log('error: ' + data);
        res.end("done");
    });
    child.on('close', function(code) {
        try {
            contents = JSON.parse(contents);
            res.end("done");
        } catch(e) {
            res.end("done");
         }
        
    });
};

})





