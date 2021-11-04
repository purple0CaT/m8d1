import createHttpError from "http-errors";
import UserSchema from "../users/schema.js";
import { verifyJWT, verifyRefreshToken } from "./authorization.js";

export const JWTAuthMiddle = async (req, res, next) => {
  if (!req.cookies.refreshToken && !req.cookies.accessToken) {
    next(createHttpError(401, "Provide credentials in Authorization Header"));
  } else {
    try {
      // const token = req.headers.authorization.replace("Bearer ", "");
      const tokens = req.cookies.asccesToken;
      const decodedToken = await verifyJWT(tokens.asccesToken);
      // console.log(decodedToken);
      const user = await UserSchema.findById(decodedToken._id);
      req.user = user;
      next();
    } catch (error) {
      // Verify REFRESH TOKEN
      try {
        const cookieRefToken = req.cookies.refreshToken;
        // console.log("Ref token",cookieRefToken);
        const { accessToken, refreshToken } = await verifyRefreshToken(
          cookieRefToken
        );
        const decodedToken = await verifyJWT(accessToken);
        const user = await UserSchema.findById(decodedToken._id);
        // console.log(user.refreshToken);
        user.refreshToken = refreshToken;
        await user.save();
        req.user = user;
        next();
      } catch (error) {
        console.log(error);
        next(createHttpError(401, "Not valid token!"));
      }
    }
  }
};
