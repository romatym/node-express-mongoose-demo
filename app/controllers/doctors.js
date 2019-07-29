'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Doctor = mongoose.model('Doctor');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function* (req, res, next, id) {
  try {
    req.doctor = yield Doctor.load(id);
    if (!req.doctor) return next(new Error('Doctor not found'));
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

  const doctors = yield Doctor.list(options);
  const count = yield Doctor.countDocuments();

  res.render('doctors/index', {
    title: 'Doctors',
    doctors: doctors,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New doctor
 */

exports.new = async(function* (req, res) {
  
  var newDoctor = new Doctor();
  const templatesList = yield Doctor.fillTemplates();
  newDoctor.templates = templatesList.slice(0);

  res.render('doctors/new', {
    title: 'New Doctor',
    doctor: newDoctor
  });
});

/**
 * Create an doctor
 */

exports.create = async(function* (req, res) {
  const doctor = new Doctor(only(req.body, 'name phone email specialization template comment'));
  doctor.user = req.user;
  try {
    yield doctor.uploadAndSave(req.file);
    req.flash('success', 'Successfully created doctor!');
    res.redirect(`/doctors/${doctor._id}`);
  } catch (err) {
    res.status(422).render('doctors/new', {
      title: doctor.name || 'New Doctor',
      errors: [err.toString()],
      doctor
    });
  }
});

/**
 * Edit a doctor
 */

exports.edit = async(function* (req, res) {
  
  const templatesList = yield Doctor.fillTemplates();
  req.doctor.templates = templatesList.slice(0);
  
  res.render('doctors/edit', {
    title: 'Edit ' + req.doctor.name,
    doctor: req.doctor
  });
});

/**
 * Update doctor
 */

exports.update = async(function* (req, res) {
  const doctor = req.doctor;
  //const aaa = retProp(req.body, 'name phone email specialization template comment');
  assign(doctor, only(req.body, 'name phone email specialization comment'));

  const templatesList = yield Doctor.fillTemplates();
  const templateObj = templatesList.find(obj => { return obj.title === req.body.template; });
  doctor.template = { name: templateObj.title, id: templateObj._id };

  doctor.user = req.user;

  try {
    yield doctor.uploadAndSave(req.file);
    res.redirect(`/doctors/${doctor._id}`);
  } catch (err) {
    res.status(422).render('doctors/edit', {
      title: 'Edit ' + doctor.name,
      errors: [err.toString()],
      doctor
    });
  }
});

/**
 * Show
 */

exports.show = function (req, res) {
  res.render('doctors/show', {
    title: req.doctor.name,
    doctor: req.doctor
  });
};

/**
 * Delete an doctor
 */

exports.destroy = async(function* (req, res) {
  yield req.doctor.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/doctors');
});
