import express from "express";
import createHttpError from "http-errors";
import { basicAuthorization } from "../middlewares/authorization.js";
import { checkPost } from "../middlewares/postAuth.js";
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
postRoute
  .route("/:id")
  .put(basicAuthorization, checkPost, async (req, res, next) => {
    try {
      const modifPost = await PostSchema.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );
      res.send(modifPost);
    } catch (error) {
      next(error);
    }
  })
  .delete(basicAuthorization, checkPost, async (req, res, next) => {
    try {
      const deletePost = await PostSchema.findByIdAndDelete(req.params.id);
      res.status(201).send("Deleted!");
    } catch (error) {
      next(error);
    }
  });

export default postRoute;
