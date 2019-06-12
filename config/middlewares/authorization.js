'use strict';

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  if (req.method == 'GET') req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function(req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/users/' + req.profile.id);
    }
    next();
  }
};

/*
 *  Article authorization routing middleware
 */

exports.article = {
  hasAuthorization: function(req, res, next) {
    if (req.article.user.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/articles/' + req.article.id);
    }
    next();
  }
};

/*
 *  Template authorization routing middleware
 */

exports.template = {
  hasAuthorization: function(req, res, next) {
    if (req.template.user.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/templates/' + req.template.id);
    }
    next();
  }
};

/*
 *  Doctor authorization routing middleware
 */

exports.doctor = {
  hasAuthorization: function(req, res, next) {
    if (req.doctor.user.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/doctors/' + req.doctor.id);
    }
    next();
  }
};

/*
 *  appointments authorization routing middleware
 */

exports.appointment = {
  hasAuthorization: function(req, res, next) {
    if (req.appointment.user.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/appointments/' + req.appointment.id);
    }
    next();
  }
};

/**
 * Comment authorization routing middleware
 */

exports.comment = {
  hasAuthorization: function(req, res, next) {
    // if the current user is comment owner or article owner
    // give them authority to delete
    if (
      req.user.id === req.comment.user.id ||
      req.user.id === req.article.user.id
    ) {
      next();
    } else {
      req.flash('info', 'You are not authorized');
      res.redirect('/articles/' + req.article.id);
    }
  }
};
