import express from "express";
import createHttpError from "http-errors";
// import { basicAuthorization } from "../middlewares/authorization.js";
import UserSchema from "./schema.js";
import PostSchema from "../post/schema.js";
import { JWTAuthMiddle } from "../middlewares/authMiddleware.js";
import {
  JWTauthenticate,
  verifyRefreshToken,
  verifyRefrJWT,
} from "../middlewares/authorization.js";
import passport from "passport";
const userRoute = express.Router();

// userRoute
//   .route("/")
//   .get(async (req, res, next) => {
//     try {
//       const users = await UserSchema.find();
//       res.send(users);
//     } catch (error) {
//       next(error);
//     }
//   })
//   .post(async (req, res, next) => {
//     try {
//       const newUser = new UserSchema(req.body);
//       const { _id } = await newUser.save();
//       res.send(_id);
//     } catch (error) {
//       next(error);
//     }
//   })
//   .delete(async (req, res, next) => {
//     try {
//       const userDel = await UserSchema.findByIdAndDelete(req.body.id);
//       if (userDel) {
//         res.status(200).send("Deleted!");
//       } else {
//         next(createHttpError(500));
//       }
//     } catch (error) {
//       next(error);
//     }
//   });

userRoute.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
userRoute.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      res.cookie("accessToken", req.user.tokens.accessToken, {
        httpOnly: true,
        secure: (process.env.NODE_ENV = "production" ? true : false),
        sameSite: "none",
      });
      res.cookie("refreshToken", req.user.tokens.refreshToken, {
        httpOnly: true,
        secure: (process.env.NODE_ENV = "production" ? true : false),
        sameSite: "none",
      });
      res.redirect(
        `http://localhost:3000?token=${req.user.tokens.accessToken}&refreshAccessToken=${req.user.tokens.refreshToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);
userRoute.get("/me", JWTAuthMiddle, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});
userRoute.get("/me/stories", JWTAuthMiddle, async (req, res, next) => {
  try {
    const users = await PostSchema.find(
      { author: req.user._id },
      { __v: 0 }
    ).populate("author");
    res.send(users);
  } catch (error) {
    next(error);
  }
});
// ===
userRoute.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserSchema(req.body);
    const { _id } = await newUser.save();
    res.send({ _id });
  } catch (error) {
    next(error);
  }
});
userRoute.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserSchema.checkCred(email, password);
    if (user) {
      const { accessToken, refreshToken } = await JWTauthenticate(user);
      res.send({ accessToken, refreshToken });
    } else {
      next(createHttpError(401, "Something wrong with email or pass"));
    }
  } catch (error) {
    next(error);
  }
});
userRoute.post("/refreshToken", async (req, res, next) => {
  try {
    const { currentRefreshToken } = req.body;
    const { accessToken, refreshToken } = await verifyRefreshToken(
      currentRefreshToken
    );
    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});
userRoute.post("/logout", JWTAuthMiddle, async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.send("Logged out!");
  } catch (error) {
    next(error);
  }
});

export default userRoute;
