require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyparser = require("body-parser")

var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/users');
const User = require('./src/routes/User');
const Auth = require('./src/routes/Auth');
const Folder = require('./src/routes/Folder')
const File = require('./src/routes/Files')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, './src/views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
// app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './src/public')));
app.use('asset',express.static(path.join(__dirname,'./src/public/asses')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user',User);
app.use('/auth',Auth);
app.use('/folder',Folder);
app.use('/file',File);

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

module.exports = app;
