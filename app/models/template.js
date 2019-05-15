'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const notify = require('../mailer');

// const Imager = require('imager');
// const config = require('../../config');
// const imagerConfig = require(config.root + '/config/imager.js');

const Schema = mongoose.Schema;

const getTags = tags => tags.join(',');
const setTags = tags => tags.split(',').slice(0, 10); // max tags

/**
 * Template Schema
 */

const TemplateSchema = new Schema({
  title: { type: String, default: '', trim: true, maxlength: 400 },
  body: { type: String, default: '', trim: true, maxlength: 500 },
  //answer: { type: String, default: '', maxlength: 300 },
  user: { type: Schema.ObjectId, ref: 'User' },
  questions: [
    {
      question: { type: String, default: '', maxlength: 1000 },
      answers: [
        { 
          answer: { type: String, default: '', maxlength: 300 }
        }
      ]
    }
  ]
});

/**
 * Validations
 */

TemplateSchema.path('title').required(true, 'Template title cannot be blank');
TemplateSchema.path('body').required(true, 'Template body cannot be blank');

/**
 * Pre-remove hook
 */

TemplateSchema.pre('remove', function(next) {
  // const imager = new Imager(imagerConfig, 'S3');
  // const files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err);
  // }, 'article');

  next();
});

/**
 * Methods
 */

TemplateSchema.methods = {
  /**
   * Save article and upload image
   *
   * @param {Object} images
   * @api private
   */

  uploadAndSave: function(/*image*/) {
    const err = this.validateSync();
    if (err && err.toString()) throw new Error(err.toString());
    return this.save();

    /*
    if (images && !images.length) return this.save();
    const imager = new Imager(imagerConfig, 'S3');

    imager.upload(images, function (err, cdnUri, files) {
      if (err) return cb(err);
      if (files.length) {
        self.image = { cdnUri : cdnUri, files : files };
      }
      self.save(cb);
    }, 'article');
    */
  },

  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} question
   * @api private
   */

  addQuestion: function(user, question) {
    this.questions.push({
      question: question,
      user: user._id
    });

    if (!this.user.email) this.user.email = 'email@product.com';

    notify.question({
      template: this,
      currentUser: user,
      question: question
    });

    return this.save();
  },

  /**
   * Remove comment
   *
   * @param {commentId} String
   * @api private
   */

  removeComment: function(templateId) {
    const index = this.comments.map(comment => comment.id).indexOf(templateId);

    if (~index) this.templates.splice(index, 1);
    else throw new Error('Template not found');
    return this.save();
  }
};

/**
 * Statics
 */

TemplateSchema.statics = {
  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function(_id) {
    return this.findOne({ _id })
      .populate('user', 'name email username')
      .populate('templates.user')
      .exec();
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list: function(options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 10;
    return this.find(criteria)
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Template', TemplateSchema);
