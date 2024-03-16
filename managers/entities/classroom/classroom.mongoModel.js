const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
});
// Unique constraint on name within a school
classroomSchema.index({ name: 1, school: 1 }, { unique: true });

module.exports = mongoose.model('Classroom', classroomSchema);
