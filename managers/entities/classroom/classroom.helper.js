const UserModel = require("../user/user.mongoModel");
const ClassroomModel = require("../classroom/classroom.mongoModel");
const isAllowedAdminUpdate = async (userId, id) => {
  const {school: classroomSchoolID} = await ClassroomModel.findById(id)
  const { school: adminSchoolID } = await UserModel.findById(userId);
  return adminSchoolID.toString() === classroomSchoolID.toString();
 
};

const isAllowedAdminCreate = async (userId, id) => {
  const { school: adminSchoolID } = await UserModel.findById(userId);
  return adminSchoolID.toString() === id.toString();
 
};

module.exports = { isAllowedAdminCreate , isAllowedAdminUpdate };
