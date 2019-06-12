'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Appointment = mongoose.model('Appointment');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function*(req, res, next, id) {
  try {
    req.appointment = yield Appointment.load(id);
    if (!req.appointment) return next(new Error('Appointment not found'));
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

  const appointments = yield Appointment.list(options);
  const count = yield Appointment.countDocuments();

  res.render('appointments/index', {
    title: 'Appointments',
    appointments: appointments,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New appointment
 */

exports.new = function(req, res) {
  res.render('appointments/new', {
    title: 'New Appointment',
    appointment: new Appointment()
  });
};

/**
 * Create an appointment
 */

exports.create = async(function*(req, res) {
  const appointment = new Appointment(only(req.body, 'name phone email doctor comment comments tags'));
  appointment.user = req.user;
  try {
    yield appointment.uploadAndSave(req.file);
    req.flash('success', 'Successfully created appointment!');
    res.redirect(`/appointments/${appointment._id}`);
  } catch (err) {
    res.status(422).render('appointments/new', {
      title: appointment.name || 'New Appointment',
      errors: [err.toString()],
      appointment
    });
  }
});

/**
 * Edit an appointment
 */

exports.edit = function(req, res) {
  res.render('appointments/edit', {
    title: 'Edit ' + req.appointment.name,
    appointment: req.appointment
  });
};

/**
 * Update appointment
 */

exports.update = async(function*(req, res) {
  const appointment = req.appointment;
  assign(appointment, only(req.body, 'title body tags'));
  try {
    yield appointment.uploadAndSave(req.file);
    res.redirect(`/appointments/${appointment._id}`);
  } catch (err) {
    res.status(422).render('appointments/edit', {
      title: 'Edit ' + appointment.name,
      errors: [err.toString()],
      appointment
    });
  }
});

/**
 * Show
 */

exports.show = function(req, res) {
  res.render('appointments/show', {
    title: req.appointment.name,
    appointment: req.appointment
  });
};

/**
 * Delete an appointment
 */

exports.destroy = async(function*(req, res) {
  yield req.appointment.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/appointments');
});
