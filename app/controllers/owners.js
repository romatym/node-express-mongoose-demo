'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Owner = mongoose.model('Owner');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function* (req, res, next, id) {
  try {
    req.owner = yield Owner.load(id);
    if (!req.owner) return next(new Error('Owner not found'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * List
 */

exports.index = async(function* (req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 15;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const owners = yield Owner.list(options);
  const count = yield Owner.countDocuments();

  res.render('owners/index', {
    title: 'Owners',
    owners: owners,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New owner
 */

exports.new = function (req, res) {
  res.render('owners/new', {
    title: 'New Owner',
    owner: new Owner()
  });
};

/**
 * Create an owner
 */

exports.create = async(function* (req, res) {
  const owner = new Owner(only(req.body, 'name phone email adress comment'));
  owner.user = req.user;
  try {
    yield owner.uploadAndSave(req.file);
    req.flash('success', 'Successfully created owner!');
    res.redirect(`/owners/${owner._id}`);
  } catch (err) {
    res.status(422).render('owners/new', {
      title: owner.name || 'New Owner',
      errors: [err.toString()],
      owner
    });
  }
});

/**
 * Edit a owner
 */

exports.edit = function (req, res) {
  res.render('owners/edit', {
    title: 'Edit ' + req.owner.name,
    owner: req.owner
  });
};

/**
 * Update owner
 */

exports.update = async(function* (req, res) {
  const owner = req.owner;
  const aaa = only(req.body, 'name phone email adress comment');
  owner.user = req.user;
  //const aaa = retProp(req.body, 'name phone email specialization template comment');

  assign(owner, aaa);

  try {
    yield owner.uploadAndSave(req.file);
    res.redirect(`/owners/${owner._id}`);
  } catch (err) {
    res.status(422).render('owners/edit', {
      title: 'Edit ' + ownername,
      errors: [err.toString()],
      owner
    });
  }
});

/**
 * Show
 */

exports.show = function (req, res) {
  res.render('owners/show', {
    title: req.owner.name,
    owner: req.owner
  });
};

/**
 * Delete an owner
 */

exports.destroy = async(function* (req, res) {
  yield req.owner.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/owners');
});
