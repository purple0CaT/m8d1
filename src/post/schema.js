import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  title: { type: String, required: true },
  text: { type: String, required: true },
});
// PostSchema.methods.toJSON = function () {
//   const post = this;
//   const postObj = post.toObject();

//   delete postObj.__v;
//   return postObj;
// };
export default model("Post", PostSchema);
