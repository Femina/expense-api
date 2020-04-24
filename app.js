var createError = require('http-errors');
var express = require('express');
var path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const bodyParser = require('body-parser');
const cors = require('cors');
var logger = require('morgan');

//  App imports
var personsRouter = require('./routes/persons');
var transactionsRouter = require('./routes/transactions');
const ApiError = require('./utils/apiError');
const globalErrHandler = require('./controllers/errorController');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// Allow Cross-Origin requests
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API 
const limiter = rateLimit({
    max: 150,
    windowMs: 60 * 60 * 1000,
    message: 'Too Many Request from this IP, please try again in an hour'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({
    limit: '15kb'
}));

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());


// Routes
app.use('/api/v1/persons', personsRouter);
app.use('/api/v1/transactions',transactionsRouter);


app.use(globalErrHandler);

module.exports = app;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// handle undefined Routes
app.use('*', (req, res, next) => {
  const err = new ApiError(404, 'fail', 'undefined route');
  next(err, req, res, next);
});

module.exports = app;
