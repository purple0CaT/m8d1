import createHttpError from "http-errors";
import PostSchema from "../post/schema.js";

export const checkPost = async (req, res, next) => {
  const post = await PostSchema.findById(req.params.id);
  if (post.author.toString() === req.user._id.toString()) {
    next();
  } else {
    next(createHttpError(403, "You are not allowed!"));
  }
};
