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

exports.load = async(function* (req, res, next, id) {
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

exports.index = async(function* (req, res) {
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

exports.new = async(function* (req, res) {

  var newAppointment = new Appointment();
  const doctorsList = yield Appointment.fillDoctors();
  newAppointment.doctors = doctorsList.slice(0);

  res.render('appointments/new', {
    title: 'New Appointment',
    appointment: newAppointment,
    datetime: new Date().toISOString().slice(0, 16)
  });
});

/**
 * Create an appointment
 */

exports.create = async(function* (req, res) {
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

exports.edit = async(function* (req, res) {

  const doctorsList = yield Appointment.fillDoctors();
  req.appointment.doctors = doctorsList.slice(0);

  res.render('appointments/edit', {
    title: 'Edit ' + req.appointment.name,
    appointment: req.appointment,
    doctors: doctorsList,
    datetime: req.appointment.datetime.toISOString().slice(0, 16)
  });

});

/**
 * Update appointment
 */

exports.update = async(function* (req, res) {
  const appointment = req.appointment;
  
  assign(appointment, retProp(req.body, 'name phone email doctor datetime comment'));

  const doctorsList = yield Appointment.fillDoctors();
  //appointment.doctors = doctorsList.slice(0);
  appointment.doctor = doctorsList.find(obj => { return obj.name === req.body.doctor });

  try {
    appointment.uploadAndSave(req.file);
    res.redirect(`/appointments/${appointment._id}`);
  } catch (err) {
    res.status(422).render('appointments/edit', {
      title: 'Edit ' + appointment.name,
      errors: [err.toString()],
      appointment
    });
  }

});

function retProp(obj, keys) {
  obj = obj || {};
  if ('string' == typeof keys) keys = keys.split(/ +/);
  var ret = keys.reduce(function (ret, key) {
    if (null == obj[key]) return ret;
    if (key === 'question') {
      ret.questions = obj[key].map(currentValue => ({ 'question': currentValue }));
    } else {
      ret[key] = obj[key];
    }
    return ret;
  }, {});

  if (ret['questions']) {
    ret.questions.forEach((element, index) => {
      if (obj['answer_' + index]) {
        if (Array.isArray(obj['answer_' + index])) {
          element.answers = obj['answer_' + index].map(currentValue => ({ 'answer': currentValue }));
        } else {
          element.answers = [{ 'answer': obj['answer_' + index] }];
        }

      }
    });
  }
}

/**
 * Show
 */

exports.show = function (req, res) {
  res.render('appointments/show', {
    title: req.appointment.name,
    appointment: req.appointment
  });
};

/**
 * Delete an appointment
 */

exports.destroy = async(function* (req, res) {
  yield req.appointment.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/appointments');
});
