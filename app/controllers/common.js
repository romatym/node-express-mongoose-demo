'use strict';

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const Template = mongoose.model('Template');
const Article = mongoose.model('Article');
const Appointment = mongoose.model('Appointment');
const Doctor = mongoose.model('Doctor');

exports.loadByID = async(function* (req, res, next, id) {

    try {
        if (req.path.toLowerCase().includes('/templates/')) {
            req.template = yield Template.load(id);
            if (!req.template) return next(new Error('Template not found'));
        }
        else if (req.path.toLowerCase().includes('/doctors/')) {
            req.doctor = yield Doctor.load(id);
            if (!req.doctor) return next(new Error('Doctor not found'));
        }
        else if (req.path.toLowerCase().includes('/appointments/')) {
            req.appointment = yield Appointment.load(id);
            if (!req.appointment) return next(new Error('Appointment not found'));
        }
        else if (req.path.toLowerCase().includes('/articles/')) {
            req.article = yield Article.load(id);
            if (!req.article) return next(new Error('Article not found'));
        }
    } catch (err) {
        return next(err);
    }

    next();
    
});