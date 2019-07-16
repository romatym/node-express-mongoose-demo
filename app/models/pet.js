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
//var surveySchema = new Schema({ name: 'string' });

/**
 * Pet Schema
 */
const OwnerSchema = mongoose.model('Owner').schema;

const PetSchema = new Schema({
  type: { type: String, default: '', trim: true, maxlength: 100 },
  name: { type: String, default: '', trim: true, maxlength: 150 },
  sex: { type: String, default: '', trim: true, maxlength: 100 },
  breed: { type: String, default: '', trim: true, maxlength: 100 },
  //owner: { type: String, default: '', trim: true, maxlength: 100 },
  owner: OwnerSchema,
  comment: { type: String, default: '', trim: true, maxlength: 1000 },
  user: { type: Schema.ObjectId, ref: 'User' },
  // surveys: [ surveySchema ],
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

PetSchema.path('type').required(true, 'type cannot be blank');
PetSchema.path('owner').required(true, 'owner cannot be blank');

/**
 * Pre-remove hook
 */

PetSchema.pre('remove', function(next) {
  const imager = new Imager(imagerConfig, 'S3');
  const files = this.image.files;

  //if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err);
  }, 'Pet');

  next();
});

/**
 * Methods
 */

PetSchema.methods = {
  /**
   * Save Pet and upload image
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
    }, 'Pet');
    */
  }

};

/**
 * Statics
 */

PetSchema.statics = {
  /**
   * Find Pet by id
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
   * List pets
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
  },

  fillOwners: function() {
    //console.log("111");
    var Owner = mongoose.model('Owner');
    // Doctor.find({}, 'name specialization _id', function (err, doctorsList) {
    //   if (err) return handleError(err);
    //   obj.doctors = doctorsList.slice(0);
    // });
    return Owner.find({}, 'name phone _id')
      .exec();
  }
};

module.exports = mongoose.model('Pet', PetSchema);
