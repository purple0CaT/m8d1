import createHttpError from "http-errors";
import UserSchema from "../users/schema.js";
import jwt from "jsonwebtoken";
//
export const JWTauthenticate = async (user) => {
  const accessToken = await generateJWT({ _id: user._id });
  const refreshToken = await generateRefrJWT({ _id: user._id });
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};
// TOKEN CREATOR
export const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) rej(err);
        else res(token);
      }
    )
  );

// CREATE REFRESH TOKEN
export const generateRefrJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.JWT_REFR_SECRET,
      { expiresIn: "1w" },
      (err, token) => {
        if (err) rej(err);
        else res(token);
      }
    )
  );
// TOKEN VERIFICATION
export const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decodToken) => {
      if (err) rej(err);
      else res(decodToken);
    })
  );

// TOKEN REFRESH VERIFICATION
export const verifyRefrJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_REFR_SECRET, (err, decodToken) => {
      if (err) rej(err);
      else res(decodToken);
    })
  );

export const verifyRefreshToken = async (refToken) => {
  const decodeRefToken = await verifyRefrJWT(refToken);
  const user = await UserSchema.findById(decodeRefToken._id);
  if (!user) throw createHttpError(404, "No user founded!");
  if (user.refreshToken === refToken) {
    const { accessToken, refreshToken } = await JWTauthenticate(user);
    return { accessToken, refreshToken };
  } else {
    throw createHttpError(401, "Token invalid");
  }
};

// ==============
// import atob from "atob";

// export const basicAuthorization = async (req, res, next) => {
//   if (!req.headers.authorization) {
//     next(createHttpError(401));
//   } else {
//     const decodedCredentials = atob(
//       req.headers.authorization.split(" ")[1]
//     ).split(":");
//     const [email, password] = decodedCredentials;
//     const user = await UserModel.checkCred(email, password);
//     if (user) {
//       req.user = user;
//       next();
//     } else {
//       next(createHttpError(403));
//     }
//   }
// };
