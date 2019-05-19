'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const { respond, respondOrRedirect } = require('../utils');
const Template = mongoose.model('Template');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function*(req, res, next, id) {
  try {
    req.template = yield Template.load(id);
    if (!req.template) return next(new Error('Template not found'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * List
 */

exports.index = async(function*(req, res) {

  console.log('3333333333 templates');

  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 15;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const templates = yield Template.list(options);
  const count = yield Template.count();

  console.log('4444444444 templates');

  respond(res, 'templates/index', {
    title: 'Templates',
    templates: templates,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New template
 */

exports.new = function(req, res) {
  res.render('templates/new', {
    title: 'New Template1',
    template: new Template()
  });
};

/**
 * Create a templates
 * Upload an image
 */

exports.create = async(function*(req, res) {
  const template = new Template(only(req.body, 'title body tags'));
  template.user = req.user;
  try {
    yield template.uploadAndSave(req.file);
    respondOrRedirect({ req, res }, `/templates/${template._id}`, template, {
      type: 'success',
      text: 'Successfully created template!'
    });
  } catch (err) {
    respond(
      res,
      'templates/new',
      {
        title: template.title || 'New template',
        errors: [err.toString()],
        template
      },
      422
    );
  }
});

/**
 * Edit a template
 */

exports.edit = function(req, res) {
  res.render('templates/edit', {
    title: 'Edit ' + req.template.title,
    template: req.template
  });
};

/**
 * Update template
 */

exports.update = async(function*(req, res) {
  const template = req.template;
  assign(template, only(req.body, 'title body tags'));
  try {
    yield template.uploadAndSave(req.file);
    respondOrRedirect({ res }, `/templates/${template._id}`, template);
  } catch (err) {
    respond(
      res,
      'templates/edit',
      {
        title: 'Edit ' + template.title,
        errors: [err.toString()],
        template
      },
      422
    );
  }
});

/**
 * Show
 */

exports.show = function(req, res) {
  respond(res, 'templates/show', {
    title: req.template.title,
    template: req.template
  });
};

/**
 * Delete a template
 */

exports.destroy = async(function*(req, res) {
  yield req.template.remove();
  respondOrRedirect(
    { req, res },
    '/templates',
    {},
    {
      type: 'info',
      text: 'Deleted successfully'
    }
  );
});