'use strict';

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const Template = mongoose.model('Template');
const Article = mongoose.model('Article');

exports.loadByID = async(function* (req, res, next, id) {

    try {
        if (req.path.toLowerCase().includes('/templates/')) {
            req.template = yield Template.load(id);
            if (!req.template) return next(new Error('Template not found'));
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