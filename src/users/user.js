import express from "express";
import createHttpError from "http-errors";
import UserSchema from "./schema.js";

const userRoute = express.Router();

userRoute
  .route("/")
  .get(async (req, res, next) => {
    try {
      const users = await UserSchema.find();
      res.send(users);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const newUser = new UserSchema(req.body);
      const { _id } = await newUser.save();
      res.send(_id);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const userDel = await UserSchema.findByIdAndDelete(req.body.id);
      if (userDel) {
        res.status(200).send("Deleted!");
      } else {
        next(createHttpError(500));
      }
    } catch (error) {
      next(error);
    }
  });

userRoute.get("/me/stories", async (req, res, next) => {
  const users = await UserSchema.find();
  res.send(users);
});

export default userRoute;
