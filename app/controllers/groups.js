'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Group = mongoose.model('Group');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function*(req, res, next, id) {
  try {
    req.group = yield Group.load(id);
    if (!req.group) return next(new Error('Group not found'));
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

  const groups = yield Group.list(options);
  const count = yield Group.countDocuments();

  res.render('groups/index', {
    title: 'Groups',
    groups: groups,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New group
 */

exports.new = function(req, res) {
  res.render('groups/new', {
    title: 'New Group',
    group: new Group()
  });
};

/**
 * Create an group
 */

exports.create = async(function*(req, res) {
  const group = new Group(only(req.body, 'title body tags'));
  group.user = req.user;
  try {
    yield group.uploadAndSave(req.file);
    req.flash('success', 'Successfully created group!');
    res.redirect(`/groups/${group._id}`);
  } catch (err) {
    res.status(422).render('groups/new', {
      title: group.title || 'New Group',
      errors: [err.toString()],
      group
    });
  }
});

/**
 * Edit an group
 */

exports.edit = function(req, res) {
  res.render('groups/edit', {
    title: 'Edit ' + req.group.title,
    group: req.group
  });
};

/**
 * Update group
 */

exports.update = async(function*(req, res) {
  const group = req.group;
  assign(group, only(req.body, 'title body tags'));
  try {
    yield group.uploadAndSave(req.file);
    res.redirect(`/groups/${group._id}`);
  } catch (err) {
    res.status(422).render('groups/edit', {
      title: 'Edit ' + group.title,
      errors: [err.toString()],
      group
    });
  }
});

/**
 * Show
 */

exports.show = function(req, res) {
  res.render('groups/show', {
    title: req.group.title,
    group: req.group
  });
};

/**
 * Delete an group
 */

exports.destroy = async(function*(req, res) {
  yield req.group.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/groups');
});
