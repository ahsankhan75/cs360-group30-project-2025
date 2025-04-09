// const mongoose = require('mongoose');

// const BloodRequestSchema = new mongoose.Schema({
//   requestId: { type: String, required: true, unique: true },
//   hospitalName: { type: String, required: true },
//   bloodType: { type: String, required: true },
//   urgencyLevel: { type: String, required: true },
//   location: { type: String, required: true },
//   datePosted: { type: Date, required: true },
//   unitsNeeded: { type: Number, required: true }
// }, { collection: "blood_req" });

// module.exports = mongoose.model('BloodRequest', BloodRequestSchema);

const mongoose = require('mongoose');

// const BloodRequestSchema = new mongoose.Schema({
//   requestId: { type: String, required: true, unique: true },
//   hospitalName: { type: String, required: true },
//   bloodType: { type: String, required: true },
//   urgencyLevel: { type: String, required: true },
//   location: { type: String, required: true },
//   datePosted: { type: Date, required: true },
//   unitsNeeded: { type: Number, required: true },
//   accepted: { type: Boolean, default: false },
// }, { collection: "blood_req" });

// module.exports = mongoose.model('BloodRequest', BloodRequestSchema);


///REAL
const BloodRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  hospitalName: { type: String, required: true },
  bloodType: { type: String, required: true },
  urgencyLevel: { type: String, required: true },
  location: { type: String, required: true },
  datePosted: { type: Date, required: true },
  unitsNeeded: { type: Number, required: true },
  accepted: { type: Boolean, default: false }, // 👈 Add this
}, { collection: "blood_req" });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);


