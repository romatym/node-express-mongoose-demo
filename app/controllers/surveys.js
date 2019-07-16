'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Survey = mongoose.model('Survey');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function*(req, res, next, id) {
  try {
    req.survey = yield Survey.load(id);
    if (!req.survey) return next(new Error('Survey not found'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * List
 */

exports.index = async(function*(req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 15;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const surveys = yield Survey.list(options);
  const count = yield Survey.countDocuments();

  res.render('surveys/index', {
    title: 'Surveys',
    surveys: surveys,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New survey
 */

exports.new = function(req, res) {
  res.render('surveys/new', {
    title: 'New Survey',
    survey: new Survey()
  });
};

/**
 * Create an survey
 */

exports.create = async(function*(req, res) {
  const survey = new Survey(only(req.body, 'title body tags'));
  survey.user = req.user;
  try {
    yield survey.uploadAndSave(req.file);
    req.flash('success', 'Successfully created survey!');
    res.redirect(`/surveys/${survey._id}`);
  } catch (err) {
    res.status(422).render('surveys/new', {
      title: survey.title || 'New Survey',
      errors: [err.toString()],
      survey
    });
  }
});

/**
 * Edit an survey
 */

exports.edit = function(req, res) {
  res.render('surveys/edit', {
    title: 'Edit ' + req.survey.title,
    survey: req.survey
  });
};

/**
 * Update survey
 */

exports.update = async(function*(req, res) {
  const survey = req.survey;
  assign(survey, only(req.body, 'title body tags'));
  try {
    yield survey.uploadAndSave(req.file);
    res.redirect(`/surveys/${survey._id}`);
  } catch (err) {
    res.status(422).render('surveys/edit', {
      title: 'Edit ' + survey.title,
      errors: [err.toString()],
      survey
    });
  }
});

/**
 * Show
 */

exports.show = function(req, res) {
  res.render('surveys/show', {
    title: req.survey.title,
    survey: req.survey
  });
};

/**
 * Delete an survey
 */

exports.destroy = async(function*(req, res) {
  yield req.survey.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/surveys');
});
