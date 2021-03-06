'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Template = mongoose.model('Template');
//const Article = mongoose.model('Article');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function* (req, res, next, id) {
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

exports.index = async(function* (req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 15;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const templates = yield Template.list(options);
  const count = yield Template.countDocuments();

  res.render('templates/index', {
    title: 'Templates',
    templates: templates,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New template
 */

exports.new = function (req, res) {
  res.render('templates/new', {
    title: 'New Template',
    template: new Template()
  });
};

/**
 * Create an template
 */

exports.create = async(function* (req, res) {
  const template = new Template(only(req.body, 'title body tags'));
  template.user = req.user;
  try {
    yield template.uploadAndSave(req.file);
    req.flash('success', 'Successfully created template!');
    res.redirect(`/templates/${template._id}`);
  } catch (err) {
    res.status(422).render('templates/new', {
      title: template.title || 'New Template',
      errors: [err.toString()],
      template
    });
  }
});

/**
 * Edit an template
 */

exports.edit = function (req, res) {
  res.render('templates/edit', {
    title: 'Edit ' + req.template.title,
    template: req.template
  });
};

/**
 * Update template
 */

exports.update = async(function* (req, res) {
  const template = req.template;
  //const aaa = only(req.body, 'title body questions tags');
  const aaa = retProp(req.body, 'title body question answer tags');

  assign(template, aaa);
  try {
    yield template.uploadAndSave(req.file);
    res.redirect(`/templates/${template._id}`);
  } catch (err) {
    res.status(422).render('templates/edit', {
      title: 'Edit ' + template.title,
      errors: [err.toString()],
      template
    });
  }
});

function retProp(obj, keys){
  obj = obj || {};
  if ('string' == typeof keys) keys = keys.split(/ +/);
  var ret = keys.reduce(function(ret, key) {
    if (null == obj[key]) return ret;
    if(key === 'question') {
      ret.questions = obj[key].map(currentValue => ({'question': currentValue}) );
    } else {
      ret[key] = obj[key];
    }
    return ret;
  }, {});

  if(ret['questions']) {
    ret.questions.forEach((element, index) => {
      if(obj['answer_'+index]) {
        if( Array.isArray( obj['answer_'+index]) ) {
          element.answers = obj['answer_'+index].map(currentValue => ({'answer': currentValue}) );
        } else {
          element.answers = [{'answer': obj['answer_'+index]}];
        }
        
      }
    });
  }

  // module.exports = function(obj, keys){
  //   obj = obj || {};
  //   if ('string' == typeof keys) keys = keys.split(/ +/);
  //   return keys.reduce(function(ret, key){
  //     if(key === 'question' || key === 'questions') {
  //       ret['questions'] = obj[key].map(element => ({ 'question': element }));
  //     } else  {
  //       if (null == obj[key]) return ret;
  //       ret[key] = obj[key];
  //     }
  //     return ret;
  //   }, {});
  // };
  

  return ret;
};

/**
 * Show
 */

exports.show = function (req, res) {
  res.render('templates/show', {
    title: req.template.title,
    template: req.template
  });
};

/**
 * Delete an template
 */

exports.destroy = async(function* (req, res) {
  yield req.template.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/templates');
});
