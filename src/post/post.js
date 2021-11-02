import express from "express";
import createHttpError from "http-errors";
import PostSchema from "./schema.js";

const postRoute = express.Router();
postRoute
  .route("/")
  .get(async (req, res, next) => {
    try {
      const posts = await PostSchema.find().populate("author");
      res.send(posts);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const newPost = new PostSchema(req.body);
      const { _id } = await newPost.save();
      res.send({ _id });
    } catch (error) {
      next(error);
    }
  });

export default postRoute;
