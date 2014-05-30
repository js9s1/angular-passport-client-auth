'use strict';

var express = require('express'),
    favicon = require('static-favicon'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    session = require('cookie-session'),
    errorHandler = require('errorhandler'),
    path = require('path'),
    passport =    require('passport'),
    config = require('./config/config'),
    csrf   = require('csurf'),
    User =  require('./models/User');
    
/**
 * Express configuration
 */
module.exports = function(app) {
  var env = app.get('env');

  if ('development' === env) {
    app.use(require('connect-livereload')());

    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');
  }

  if ('production' === env) {
    app.use(compression());
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
    app.set('view engine', 'html');
    app.engine('html', require('ejs').renderFile);
  }



  app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(methodOverride());

  app.use(session(
  {
    secret: process.env.COOKIE_SECRET || "Superdupersecret",
    key: 'appAltmed',
    cookie: {
      maxAge: 1000*60*60
    }

  }));
/*  app.use(csrf);
  app.use(function(req, res, next) {
    res.locals.token = req.session._csrf;
//    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });
  */


  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(User.localStrategy);
  passport.use(User.googleStrategy());   // Comment out this line if you don't want to enable login via Google
//passport.use(User.facebookStrategy()); // Comment out this line if you don't want to enable login via Facebook
//passport.use(User.linkedInStrategy()); // Comment out this line if you don't want to enable login via LinkedIn
//passport.use(User.twitterStrategy());  // Comment out this line if you don't want to enable login via Twitter

  passport.serializeUser(User.serializeUser);
  passport.deserializeUser(User.deserializeUser);

  // Error handler - has to be last
  if ('development' === app.get('env')) {
    app.use(errorHandler());
  }
};
