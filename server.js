var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var app = express();
require("winston-daily-rotate-file");
require('dotenv').config();

var query = require('./database/query.js');
var moment = require('moment');
var fs = require('fs');
var logger = require('./Log.js');
moment.tz.setDefault('Asia/Seoul');


app.enable("view cache")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => { 
  console.log('PollingStart'); 
      res.send(); 
  }); 
  app.get('/index', (req, res) => { 
    res.redirect('/'); 
}); 


app.get('/index.html', (req, res) => { 
    res.redirect('/'); 
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
const pollingPushMessage = () => {
  setInterval(function() {

    if(fs.existsSync(`${process.env.LOG_PATH}/${moment().subtract("1","y").format('YYYY-MM-DD')}.log`)) {
      deleteLog();
    }
    logger.Log('PollingStart','info');
    
    query.searchPushMessage();
    
  }, process.env.PUSH_INTERVAL);
}

const deleteLog = () => {


  fs.access(`${process.env.LOG_PATH}/${moment().subtract("1","y").format('YYYY-MM-DD')}.log`, fs.constants.F_OK, (err) => {
    if(err) {
      logger.Log('Delete fail Log File   Location "'+moment().subtract("1","y").format('YYYY-MM-DD') + '.log'+'"' , 'info');
      return;
    }
    fs.unlink(`${process.env.LOG_PATH}/${moment().subtract("1","y").format('YYYY-MM-DD')}.log`, (err) => err?
      logger.Log('Delete fail Log File   Location "'+moment().subtract("1","y").format('YYYY-MM-DD') + '.log'+'"' , 'info'):
      logger.Log('Success Delete Log File   Location "'+moment().subtract("1","y").format('YYYY-MM-DD') + '.log'+'"' , 'info')
    )
  })
  
    // 
  
}

const port = process.env.PORT_NUM;
app.listen(port, () => console.log(`Listening on port ${port}`))



pollingPushMessage();

module.exports = app;





