'use strict';
var express = require('express');
var app = express();
var multer  =   require('multer');
var putURL = 'http://localhost:8000/';

var filePath ;
global.MAX_UPLOAD_LIMIT = 10;



app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'))
app.set('port', (process.env.PORT || 8000));

app.get('/', function (req, res) {
    res.render('home');
});
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});

//var upload = multer({ dest: '../uploads/' })
var upload = multer({ storage: storage })

//FOR MULTIPLE FILE UPLOAD
app.post('/profile',upload.array('avatar', global.MAX_UPLOAD_LIMIT), function (req, res, next) {


//FOR SINGLE FILE UPLOAD
//app.post('/profile',upload.single('avatar'), function (req, res, next) {
	

	
  
  try {
        //res.send(req.files);
		res.render('goback');
		var _total_size_in_MB = 0;
		req.files.map((_file_info)=>{
			var _file_size_in_MB = _file_info.size/1048576;
			console.log("\n\n\n\n "+_file_info.originalname);
			console.log("\n "+_file_size_in_MB+" MB");
			_total_size_in_MB += _file_info.size;
	})
	_total_size_in_MB /= 1048576;
	console.log("\n\n\n\n TOTAL SIZE : "+_total_size_in_MB+" MB");
	
	
    } catch(error) {
          console.log(error);
           res.send(400);
    }

})





