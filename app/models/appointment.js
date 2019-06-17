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
 * Appointment Schema
 */

//var DoctorSchema = require('mongoose').model('Doctor');

const AppointmentSchema = new Schema({
  name: { type: String, default: '', trim: true, maxlength: 150 },
  phone: { type: String, default: '', trim: true, maxlength: 100 },
  email: { type: String, default: '', trim: true, maxlength: 100 },
  doctor: { type: String, default: '', trim: true, maxlength: 100 },
  //doctor: DoctorSchema,
  datetime: { type: Date, default: Date.now },
  comment: { type: String, default: '', trim: true, maxlength: 1000 },
  user: { type: Schema.ObjectId, ref: 'User' },
  comments: [
    {
      body: { type: String, default: '', maxlength: 1000 },
      user: { type: Schema.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  tags: { type: [], get: getTags, set: setTags },
  image: {
    cdnUri: String,
    files: []
  },
  createdAt: { type: Date, default: Date.now }
});

/**
 * Validations
 */

AppointmentSchema.path('name').required(true, 'Appointment name cannot be blank');
AppointmentSchema.path('phone').required(true, 'Appointment phone cannot be blank');
AppointmentSchema.path('doctor').required(true, 'Appointment doctor cannot be blank');

/**
 * Pre-remove hook
 */

AppointmentSchema.pre('remove', function(next) {
  // const imager = new Imager(imagerConfig, 'S3');
  // const files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err);
  // }, 'Appointment');

  next();
});

/**
 * Methods
 */

AppointmentSchema.methods = {
  /**
   * Save Appointment and upload image
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
    }, 'Appointment');
    */
  },

  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @api private
   */

  addComment: function(user, comment) {
    this.comments.push({
      body: comment.body,
      user: user._id
    });

    if (!this.user.email) this.user.email = 'email@product.com';

    notify.comment({
      Appointment: this,
      currentUser: user,
      comment: comment.body
    });

    return this.save();
  },

  /**
   * Remove comment
   *
   * @param {commentId} String
   * @api private
   */

  removeComment: function(commentId) {
    const index = this.comments.map(comment => comment.id).indexOf(commentId);

    if (~index) this.comments.splice(index, 1);
    else throw new Error('Comment not found');
    return this.save();
  }
};

/**
 * Statics
 */

AppointmentSchema.statics = {
  /**
   * Find Appointment by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function(_id) {
    return this.findOne({ _id })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec();
  },

  /**
   * List appointments
   *
   * @param {Object} options
   * @api private
   */

  list: function(options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Appointment', AppointmentSchema);
