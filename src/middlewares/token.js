import createHttpError from "http-errors";
import UserSchema from "../users/schema.js";
import { verifyJWT } from "./authorization.js";

export const JWTAuthMiddle = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Provide credentials in Authorization Header"));
  } else {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      const decodedToken = await verifyJWT(token);
      const user = await UserSchema.findById(decodedToken._id);
      req.user = user;
      next();
    } catch (error) {
      next(createHttpError(401, "Not valid token!"));
    }
  }
};
