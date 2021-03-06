# testing-file-upload

This is code exploring file uploading using command line CURL and Node's [request module](https://github.com/request/request). It's related to this [Stack Overflow question](http://stackoverflow.com/questions/28245729/what-is-the-equivalent-of-curl-upload-file-in-node-request).

I'm basically just trying to figure out how to get Request to do the same thing as CURL.


Ctrl+A → Move cursor to the beginning of line
Ctrl+C → Abort (send SIGINT to) current process
Ctrl+D → Logout of a terminal session
Ctrl+E → Move cursor to the end of line
Ctrl+K → Delete from cursor to the end of line
Ctrl+U → Delete from cursor to the beginning of line
Ctrl+L → Clear the terminal
Ctrl+Z → Suspend (send SIGTSTP to) current process
Ctrl+W → Clear prompt before word (a word is a set of characters after a space)
Ctrl+alt+C → Open new session (only works in Hacker's Keyboard)
The Volume up key also serves as a special key to produce certain input:

Volume Up+E → Escape key
Volume Up+T → Tab key
Volume Up+1 → F1 (and Volume Up+2 → F2, etc)
Volume Up+0 → F10
Volume Up+B → Alt+B, back a word when using readline
Volume Up+F → Alt+F, forward a word when using readline
Volume Up+X → Alt+X
Volume Up+W → Up arrow key
Volume Up+A → Left arrow key
Volume Up+S → Down arrow key
Volume Up+D → Right arrow key
Volume Up+L → | (the pipe character)
Volume Up+H → ~ (the tilde character)
Volume Up+U → _ (underscore)
Volume Up+P → Page Up
Volume Up+N → Page Down
Volume Up+. → Ctrl+\ (SIGQUIT)
Volume Up+V → Show the volume control
Volume Up+Q → Show extra keys view
Volume Up+K → Another variant to toggle extra keys view

'use strict';
var express = require('express');
var app = express();
// const path = require('path');
var multer  =   require('multer');
var getRawBody = require('raw-body')
var fs = require('fs');
var request = require('request');
// var putURL = 'http://localhost:5000/put';
// var uploadCOnfirm = require('./index.js')
var putURL = 'http://localhost:8000';
// var filePath = './README.md';
var contentType = 'application/octet-stream';
var transferEncoding = 'chunked';

var filePath ;
// = uploadCOnfirm.filePath;

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
  console.log("path aaja ---> ",req.file)
  // module.exports.
  
  // module.exports.
//   putURL = 'http://localhost:5000';
  filePath= req.file.path;
  app.use(function (req, res, next) {
    
    if (req.headers['content-type'] === 'application/octet-stream') {
        getRawBody(req, {
            length: req.headers['content-length'],
            //encoding: this.charset
        }, function (err, string) {
            if (err) { return next(err); }
            req.body = string;
            next();
        });
    } else {
        next();
    }
});

app.put('/put', function(request, response) {
    var body;
    if ( request.body ) {
        body = request.body.toString('utf8');
    } else {
        body = '';
    }

    response.json({
        headers: {
            'content-type' : request.headers['content-type'],
            'transfer-encoding' : request.headers['transfer-encoding'],
        },
        fileContents: body
    });
});

function curlFileUpload(callback) {
    var curlCommand;
    // curlCommand = 'curl -v -X PUT -L "'+putURL+'" --header "Content-Type:'+contentType+'" --header "Transfer-Encoding:'+transferEncoding+'" -T "'+filePath+'"';
    curlCommand = 'curl -X PUT --upload-file "'+filePath+'" "'+putURL+'"';
    var exec = require('child_process').exec;
    var child = exec(curlCommand);
    var contents = '';
    child.stdout.on('data', function(data) {
        contents += data;
    });
    child.stderr.on('data', function(data) {
        //console.log('error: ' + data);
    });
    child.on('close', function(code) {
        try {
            contents = JSON.parse(contents);
        } catch(e) { }
        if ( callback ) {
            callback(contents);
        }
    });
};

function requestFileUploadString(callback) {
    var options = {
        method: 'put',
        headers: {
            'content-type': contentType,
            'transfer-encoding': transferEncoding
        }, 
        body: fs.readFileSync(filePath, 'utf8'),
        //body: fs.createReadStream(filePath),
        //fs.createReadStream(filePath)
        //multipart : [
        //]
    };
    request(putURL, options, function(err, httpResponse, body) {
        if ( err ) {
            console.log('err', err);
        } else {
            try {
                body = JSON.parse(body);
            } catch(e) {}

            if ( callback ) {
                callback(body);
            }
        }
    });
};

function requestFileUploadStream(callback) {
    var options = {
        method: 'put',
        headers: {
            'content-type': contentType,
            'transfer-encoding': transferEncoding
        }
    };
    fs.createReadStream(filePath).pipe(request(putURL,options,function(err, httpsResponse, body){
        if ( err ) {
            console.log('err', err);
        } else {
            try {
                body = JSON.parse(body);
            } catch(e) {}

            if ( callback ) {
                callback(body);
            }
        }
    }));
};


// First do a CURL file upload
curlFileUpload(function(contents) {
    console.log('\n');
    if ( runTest(contents) === 1 ) {
        console.log('*** All tests passed for CURL upload.');
    } else {
        console.log('*** Tests failed. CURL response');
        console.log(contents);
    }
});

// Then, do a request upload reading the file into memory
requestFileUploadString(function(contents) {
    console.log('\n');
    if ( runTest(contents) === 1 ) {
        console.log('*** All tests passed for Request string upload.');
    } else {
        console.log('*** Tests failed. Request Stream response');
        console.log(contents);
    }
});

// Then, do a request upload reading the file as a stream 
requestFileUploadStream(function(contents) {
    console.log('\n');
    if ( runTest(contents) === 1 ) {
        console.log('*** All tests passed for Request Stream upload.');
    } else {
        console.log('*** Tests failed. Request Stream response');
        console.log(contents);
    }
});

function runTest(contents) {
    var expectedFileContents = fsrunTest.readFileSync(filePath, 'utf8');
    if ( ! contents ) { console.error('No Contents'); }
    else if ( contents.headers['content-type'] !== contentType ) {
        console.error('Content type does not match');
        console.log('Expected', contentType, 'Actual', contents.headers['content-type']);
    }
    else if ( contents.headers['transfer-encoding'] !== transferEncoding ) {
        console.error('Transfer Encoding does not match');
        console.log('Expected', transferEncoding, 'Actual', contents.headers['transfer-encoding']);
    }
    else if ( contents.fileContents != expectedFileContents ) {
        console.error('File Contents do not match');
        console.log('Expected', expectedFileContents, 'Actual', contents.fileContents);
    } else {
        return 1;
    }

    return 1;
};
  
  
  // callback(filePath)
  // require('./uploadReady')
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})





