import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: {
    type: String,
    required: function () {
      return !Boolean(this.gogleId);
    },
  },
  role: { type: String, required: false, default: "User" },
  refreshToken: { type: String },
  googleId: {
    type: String,
    required: function () {
      return !Boolean(this.password);
    },
  },
});

UserSchema.pre("save", async function () {
  const newUser = this;
  const pass = newUser.password;

  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(pass, 10);
  }
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.__v;
  delete userObj.refreshToken;
  return userObj;
};

UserSchema.statics.checkCred = async function (email, pass) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default model("User", UserSchema);
