import createHttpError from "http-errors";
import atob from "atob";
import UserModel from "../users/schema.js";

export const basicAuthorization = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401));
  } else {
    const decodedCredentials = atob(
      req.headers.authorization.split(" ")[1]
    ).split(":");
    const [email, password] = decodedCredentials;
    const user = await UserModel.checkCred(email, password);
    if (user) {
      req.user = user;
      next();
    } else {
      next(createHttpError(403));
    }
  }
};
