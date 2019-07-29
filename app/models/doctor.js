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
 * Doctor Schema
 */
// const TemplateSchema = mongoose.model('Template').schema;

const DoctorSchema = new Schema({
  name: { type: String, default: '', trim: true, maxlength: 150 },
  phone: { type: String, default: '', trim: true, maxlength: 100 },
  email: { type: String, default: '', trim: true, maxlength: 100 },
  specialization: { type: String, default: '', trim: true, maxlength: 100 },
  //template: { type: String, default: '', trim: true, maxlength: 100 },
  template: { 
    name: { type: String, default: '', trim: true, maxlength: 100 },
    id: { type: Schema.ObjectId, ref: 'Template' },
  },
  //template: { type: Schema.ObjectId, ref: 'Template' },
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

DoctorSchema.path('name').required(true, 'Doctor Name cannot be blank');
DoctorSchema.path('specialization').required(true, 'Doctor Specialization cannot be blank');

/**
 * Pre-remove hook
 */

DoctorSchema.pre('remove', function(next) {
  const imager = new Imager(imagerConfig, 'S3');
  const files = this.image.files;

  //if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err);
  }, 'Doctor');

  next();
});

/**
 * Methods
 */

DoctorSchema.methods = {
  /**
   * Save Doctor and upload image
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
    }, 'Doctor');
    */
  }

};

/**
 * Statics
 */

DoctorSchema.statics = {
  /**
   * Find Doctor by id
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
   * List doctors
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

  fillTemplates: function() {
    var Template = mongoose.model('Template');
    // Doctor.find({}, 'name specialization _id', function (err, doctorsList) {
    //   if (err) return handleError(err);
    //   obj.doctors = doctorsList.slice(0);
    // });
    return Template.find({}, 'title _id')
      .exec();
  }

};

module.exports = mongoose.model('Doctor', DoctorSchema);

//const DoctorSchema = mongoose.models.DoctorSchema || mongoose.model('Doctor', DoctorSchema);
//module.exports = mongoose.model('Doctor', DoctorSchema);