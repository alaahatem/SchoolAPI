const mongoose = require('mongoose');
const paginationSchema = require('../_common/pagination.schema');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required:true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }],
  classrooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
});

module.exports = mongoose.model('School', schoolSchema);
