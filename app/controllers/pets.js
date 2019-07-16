'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Pet = mongoose.model('Pet');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function* (req, res, next, id) {
  try {
    req.pet = yield Pet.load(id);
    if (!req.pet) return next(new Error('Pet not found'));
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

  const pets = yield Pet.list(options);
  const count = yield Pet.countDocuments();

  res.render('pets/index', {
    title: 'Pets',
    pets: pets,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New pet
 */

exports.new = async(function* (req, res) {

  var newPet = new Pet();
  const ownersList = yield Pet.fillOwners();
  newPet.owners = ownersList.slice(0);

  res.render('pets/new', {
    title: 'New Pet',
    pet: newPet
  });
});

/**
 * Create an pet
 */

exports.create = async(function* (req, res) {
  const pet = new Pet(only(req.body, 'type name sex breed owner comment'));
  pet.user = req.user;
  try {
    yield pet.uploadAndSave(req.file);
    req.flash('success', 'Successfully created pet!');
    res.redirect(`/pets/${pet._id}`);
  } catch (err) {
    res.status(422).render('pets/new', {
      title: pet.name || 'New Pet',
      errors: [err.toString()],
      pet
    });
  }
});

/**
 * Edit a pet
 */

exports.edit = async(function* (req, res) {

  const ownersList = yield Pet.fillOwners();
  req.pet.owners = ownersList.slice(0);

  res.render('pets/edit', {
    title: 'Edit ' + req.pet.name,
    pet: req.pet
  });
});

/**
 * Update pet
 */

exports.update = async(function* (req, res) {
  const pet = req.pet;
  assign(pet, only(req.body, 'type name sex breed owner comment'));

  pet.user = req.user;
  //const aaa = retProp(req.body, 'name phone email specialization template comment');
  const ownersList = yield Pet.fillOwners();
  pet.owner = ownersList.find(obj => { return obj.name === req.body.owner });

  try {
    yield pet.uploadAndSave(req.file);
    res.redirect(`/pets/${pet._id}`);
  } catch (err) {
    res.status(422).render('pets/edit', {
      title: 'Edit ' + petname,
      errors: [err.toString()],
      pet
    });
  }
});

/**
 * Show
 */

exports.show = function (req, res) {
  res.render('pets/show', {
    title: req.pet.name,
    pet: req.pet
  });
};

/**
 * Delete an pet
 */

exports.destroy = async(function* (req, res) {
  yield req.pet.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/pets');
});
