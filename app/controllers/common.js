'use strict';

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const Template = mongoose.model('Template');
const Article = mongoose.model('Article');
const Appointment = mongoose.model('Appointment');
const Doctor = mongoose.model('Doctor');

const Owner = mongoose.model('Owner');
const Pet = mongoose.model('Pet');
const Group = mongoose.model('Group');
const Survey = mongoose.model('Survey');

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
        else if (req.path.toLowerCase().includes('/pets/')) {
            req.pet = yield Pet.load(id);
            if (!req.pet) return next(new Error('Pet not found'));
        }
        else if (req.path.toLowerCase().includes('/owners/')) {
            req.owner = yield Owner.load(id);
            if (!req.owner) return next(new Error('Owner not found'));
        }
        else if (req.path.toLowerCase().includes('/groups/')) {
            req.group = yield Group.load(id);
            if (!req.group) return next(new Error('Group not found'));
        }
        else if (req.path.toLowerCase().includes('/surveys/')) {
            req.survey = yield Survey.load(id);
            if (!req.survey) return next(new Error('Survey not found'));
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