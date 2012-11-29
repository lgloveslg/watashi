/*global require process */

var path = require('path'),
  express = require('express'),
  app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  // set this to a secret value to encrypt session cookies
  app.use(express.session({ secret: process.env.SESSION_SECRET || 'secret123' }));
  app.use(require('faceplate').middleware({
    app_id: process.env.FACEBOOK_APP_ID,
    secret: process.env.FACEBOOK_SECRET,
    scope:  'user_likes,user_photos,user_photo_video_tags'
  }));

});

app.get('/', function (req, res) {
  res.render('index.ejs', {
    app_id: process.env.FACEBOOK_APP_ID,
    app_domain: req.headers['host']
  });
});

app.get('/friends', function(req, res) {
  req.facebook.get('/me/friends', { }, function(e, friends) {
    res.send('friends: ' + require('util').inspect(friends.data));
  });
});

app.get('/cards', function(req, res) {
  req.facebook.get('/me/friends', { limit: 70 }, function(e, friends) {
    res.render('cards.ejs', {
      title: 'Friends cards',
      friends: friends.data
    });
  });

});

app.get('/signed_request', function(req, res) {
  res.send('Signed Request details: ' + require('util').inspect(req.facebook.signed_request));
});

app.listen(app.get('port'));
