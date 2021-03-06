'use strict';

/*
 * Module dependencies.
 */

const users = require('../app/controllers/users');
const articles = require('../app/controllers/articles');
const templates = require('../app/controllers/templates');
const doctors = require('../app/controllers/doctors');

const pets = require('../app/controllers/pets');
const owners = require('../app/controllers/owners');
const groups = require('../app/controllers/groups');

const surveys = require('../app/controllers/surveys');

const appointments = require('../app/controllers/appointments');
const common = require('../app/controllers/common');
const comments = require('../app/controllers/comments');
const tags = require('../app/controllers/tags');
const auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

const articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
const templateAuth = [auth.requiresLogin, auth.template.hasAuthorization];
const doctorAuth = [auth.requiresLogin, auth.doctor.hasAuthorization];

const petAuth = [auth.requiresLogin, auth.pet.hasAuthorization];
const ownerAuth = [auth.requiresLogin, auth.owner.hasAuthorization];
const groupAuth = [auth.requiresLogin, auth.group.hasAuthorization];

const surveyAuth = [auth.requiresLogin, auth.survey.hasAuthorization];

const appointmentAuth = [auth.requiresLogin, auth.appointment.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

const fail = {
  failureRedirect: '/login'
};

/**
 * Expose routes
 */

module.exports = function(app, passport) {
  const pauth = passport.authenticate.bind(passport);

  // user routes
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.post('/users', users.create);
  app.post(
    '/users/session',
    pauth('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }),
    users.session
  );
  app.get('/users/:userId', users.show);
  // app.get('/auth/github', pauth('github', fail), users.signin);
  // app.get('/auth/github/callback', pauth('github', fail), users.authCallback);
  // app.get('/auth/twitter', pauth('twitter', fail), users.signin);
  // app.get('/auth/twitter/callback', pauth('twitter', fail), users.authCallback);
  // app.get(
  //   '/auth/google',
  //   pauth('google', {
  //     failureRedirect: '/login',
  //     scope: [
  //       'https://www.googleapis.com/auth/userinfo.profile',
  //       'https://www.googleapis.com/auth/userinfo.email'
  //     ]
  //   }),
  //   users.signin
  // );
  // app.get('/auth/google/callback', pauth('google', fail), users.authCallback);
  // app.get(
  //   '/auth/linkedin',
  //   pauth('linkedin', {
  //     failureRedirect: '/login',
  //     scope: ['r_emailaddress']
  //   }),
  //   users.signin
  // );
  // app.get(
  //   '/auth/linkedin/callback',
  //   pauth('linkedin', fail),
  //   users.authCallback
  // );

  app.param('userId', users.load);

  //articles and templates have same parameter: "id:, so i need to check path to route 
  app.param('id', common.loadByID);

  // articles routes
  //app.param('id', articles.load);
  app.get('/articles', articles.index);
  app.get('/articles/new', auth.requiresLogin, articles.new);
  app.post('/articles', auth.requiresLogin, articles.create);
  app.get('/articles/:id', articles.show);
  app.get('/articles/:id/edit', articleAuth, articles.edit);
  app.put('/articles/:id', articleAuth, articles.update);
  app.delete('/articles/:id', articleAuth, articles.destroy);

  // templates routes
  //app.param('id', templates.load);
  app.get('/templates', templates.index);
  app.get('/templates/new', auth.requiresLogin, templates.new);
  app.post('/templates', auth.requiresLogin, templates.create);
  app.get('/templates/:id', templates.show);
  app.get('/templates/:id/edit', templateAuth, templates.edit);
  app.put('/templates/:id', templateAuth, templates.update);
  app.delete('/templates/:id', templateAuth, templates.destroy);

  // doctors routes
  //app.param('id', templates.load);
  app.get('/doctors', doctors.index);
  app.get('/doctors/new', auth.requiresLogin, doctors.new);
  app.post('/doctors', auth.requiresLogin, doctors.create);
  app.get('/doctors/:id', doctors.show);
  app.get('/doctors/:id/edit', doctorAuth, doctors.edit);
  //app.get('/doctors/:id/edit', doctors.edit);
  app.put('/doctors/:id', doctorAuth, doctors.update);
  app.delete('/doctors/:id', doctorAuth, doctors.destroy);

  // owners routes
  //app.param('id', templates.load);
  app.get('/owners', owners.index);
  app.get('/owners/new', auth.requiresLogin, owners.new);
  app.post('/owners', auth.requiresLogin, owners.create);
  app.get('/owners/:id', owners.show);
  app.get('/owners/:id/edit', ownerAuth, owners.edit);
  //app.get('/owners/:id/edit', owners.edit);
  app.put('/owners/:id', ownerAuth, owners.update);
  app.delete('/owners/:id', ownerAuth, owners.destroy);

  // pets routes
  //app.param('id', templates.load);
  app.get('/pets', pets.index);
  app.get('/pets/new', auth.requiresLogin, pets.new);
  app.post('/pets', auth.requiresLogin, pets.create);
  app.get('/pets/:id', pets.show);
  app.get('/pets/:id/edit', petAuth, pets.edit);
  //app.get('/pets/:id/edit', pets.edit);
  app.put('/pets/:id', petAuth, pets.update);
  app.delete('/pets/:id', petAuth, pets.destroy);

  // groups routes
  //app.param('id', templates.load);
  app.get('/groups', groups.index);
  app.get('/groups/new', auth.requiresLogin, groups.new);
  app.post('/groups', auth.requiresLogin, groups.create);
  app.get('/groups/:id', groups.show);
  app.get('/groups/:id/edit', groupAuth, groups.edit);
  //app.get('/groups/:id/edit', groups.edit);
  app.put('/groups/:id', groupAuth, groups.update);
  app.delete('/groups/:id', groupAuth, groups.destroy);

  // surveys routes
  //app.param('id', templates.load);
  app.get('/surveys', surveys.index);
  app.get('/surveys/new', auth.requiresLogin, surveys.new);
  app.post('/surveys', auth.requiresLogin, surveys.create);
  app.get('/surveys/:id', surveys.show);
  app.get('/surveys/:id/edit', surveyAuth, surveys.edit);
  //app.get('/surveys/:id/edit', surveys.edit);
  app.put('/surveys/:id', surveyAuth, surveys.update);
  app.delete('/surveys/:id', surveyAuth, surveys.destroy);

  // appointments routes
  //app.param('id', templates.load);
  app.get('/appointments', appointments.index);
  app.get('/appointments/new', auth.requiresLogin, appointments.new);
  app.post('/appointments', auth.requiresLogin, appointments.create);
  app.get('/appointments/:id', appointments.show);
  app.get('/appointments/:id/edit', appointmentAuth, appointments.edit);
  //app.get('/appointments/:id/edit', appointments.edit);
  app.put('/appointments/:id', appointmentAuth, appointments.update);
  app.delete('/appointments/:id', appointmentAuth, appointments.destroy);

  // home route
  app.get('/', articles.index);

  // comment routes
  app.param('commentId', comments.load);
  app.post('/articles/:id/comments', auth.requiresLogin, comments.create);
  app.get('/articles/:id/comments', auth.requiresLogin, comments.create);
  app.delete(
    '/articles/:id/comments/:commentId',
    commentAuth,
    comments.destroy
  );

  // tag routes
  app.get('/tags/:tag', tags.index);

  /**
   * Error handling
   */

  app.use(function(err, req, res, next) {
    // treat as 404
    if (
      err.message &&
      (~err.message.indexOf('not found') ||
        ~err.message.indexOf('Cast to ObjectId failed'))
    ) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).render('422', { error: err.stack });
      return;
    }

    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function(req, res) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    if (req.accepts('json')) return res.status(404).json(payload);
    res.status(404).render('404', payload);
  });
};
