import createHttpError from "http-errors";
import PostSchema from "../post/schema.js";

export const checkPost = async (req, res, next) => {
  const post = await PostSchema.findById(req.params.id);
  post.author.map((auth) => {
    if (
      auth.toString() === req.user._id.toString() ||
      req.user.role === "Admin"
    ) {
      next();
    } else {
      next(createHttpError(403));
    }
  });
};
