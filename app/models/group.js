'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
//const notify = require('../mailer');

// const Imager = require('imager');
// const config = require('../../config');
// const imagerConfig = require(config.root + '/config/imager.js');

const Schema = mongoose.Schema;

/**
 * Group Schema
 */

const GroupSchema = new Schema({
  name: { type: String, default: '', trim: true, maxlength: 150 },
  comment: { type: String, default: '', trim: true, maxlength: 1000 },
  user: { type: Schema.ObjectId, ref: 'User' },
  // comments: [
  //   {
  //     body: { type: String, default: '', maxlength: 1000 },
  //     user: { type: Schema.ObjectId, ref: 'User' },
  //     createdAt: { type: Date, default: Date.now }
  //   }
  // ],
  image: {
    cdnUri: String,
    files: []
  },
  createdAt: { type: Date, default: Date.now }
});

/**
 * Validations
 */

GroupSchema.path('name').required(true, 'Group Name cannot be blank');

/**
 * Pre-remove hook
 */

GroupSchema.pre('remove', function(next) {
  const imager = new Imager(imagerConfig, 'S3');
  const files = this.image.files;

  //if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err);
  }, 'Group');

  next();
});

/**
 * Methods
 */

GroupSchema.methods = {
  /**
   * Save Group and upload image
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
    }, 'Group');
    */
  }

};

/**
 * Statics
 */

GroupSchema.statics = {
  /**
   * Find Group by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function(_id) {
    return this.findOne({ _id })
      .populate({ path: 'user', select: 'name email username' })
      .exec();
  },

  /**
   * List groups
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

mongoose.model('Group', GroupSchema);
