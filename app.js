require("dotenv").config();
var colors = require('colors');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyparser = require("body-parser")
const fileUpload=require("express-fileupload");

var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/users');
const User = require('./src/routes/User');
const Auth = require('./src/routes/Auth');
const Folder = require('./src/routes/Folder');
const File = require('./src/routes/Files');
const Permission = require('./src/routes/Permission');
const Share = require('./src/routes/Share');
const Master  = require('./src/routes/Master');
const Explore  = require("./src/routes/Explore");
const Analytics = require("./src/routes/Analytics");
const Test = require("./src/routes/Test");
const Rooms = require("./src/routes/Rooms");
const Bugs = require("./src/routes/Bugs");
const Admin = require("./src/routes/Admin");
const LUpload = require("./src/routes/LUpload");

const auditsrv = require("./src/services/Audit");

var app = express();

colors.enable();
// view engine setup
app.set('views', path.join(__dirname, './src/views'));
app.set('view engine', 'ejs');

// app.use((req, res, next) => {
//   // Set caching headers
//   res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
//   res.setHeader('Expires', new Date(Date.now() + 450000).toUTCString()); // Cache for 1 hour

//   // Call the next middleware in the stack
//   next();
// });

app.use(logger(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    `pid = ${process.pid}`
  ].join(' ').red
}));

app.use(async(req,res,next)=>{
  let urlsp = req.url.split("/");
  if (urlsp[1]!="assets"||urlsp[1]!="src") {
    try {
      await auditsrv.set_page_by_user(urlsp,req.ip);
    } catch (error) {
      console.error("not able to audit : ",error.message);
    }
  }
  next();
})
// app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './src/public/'),{
  maxAge:"1day"
}));
app.use("/roomsthumb",express.static(path.join(__dirname,"./src/uploads/roomst")));
app.use("/src/main.js",express.static(path.join(__dirname,"./src/public/assets/js/main.js")));
app.use('/assets',express.static(path.join(__dirname,'./src/public/asset/')));
app.use("/uploads",express.static(path.join(__dirname,"./src/uploads/")));
app.use("/folder",fileUpload({
  useTempFiles : true,
  tempFileDir : './src/tmp'
}));
app.use("/file",fileUpload({
  useTempFiles : true,
  tempFileDir : './src/tmp'
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user',User);
app.use('/auth',Auth);
app.use('/folder',Folder);
app.use('/file',File);
app.use('/permission',Permission);
app.use('/share',Share);
app.use('/master',Master);
app.use("/explore",Explore);
app.use("/analytics",Analytics);
app.use("/rooms",Rooms);
app.use("/bugs",Bugs);
app.use("/admin",Admin);
app.use("/large-upload",LUpload);
// app.use("/test",Test);

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
