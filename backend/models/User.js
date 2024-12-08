const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  key:{
    type: String,
    required: true, 
  },
  filename: {
    type: String,
    required: true, 
  },
  fileurl: {
    type: String,
    required: true, 
  },
}, {
  timestamps: true, 
});


const User = mongoose.model("User", userSchema);
module.exports = User;
