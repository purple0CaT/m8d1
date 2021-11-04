import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import UserSchema from "../users/schema.js";
import { JWTauthenticate } from "./authorization.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_OAUTH_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    callbackURL: `${process.env.B_URL}/user/googleRedirect`,
  },
  async (accessToken, refreshToken, googleProfile, passNext) => {
    const user = await UserSchema.findOne({ googleId: googleProfile.id });
    if (user) {
      const tokens = await JWTauthenticate(user);
      user.refreshToken = tokens.refreshToken;
      await user.save();
      passNext(null, { tokens });
    } else {
      try {
        const newUser = {
          name: googleProfile.name.givenName,
          email: googleProfile.emails[0].value,
          googleId: googleProfile.id,
          refreshToken: "",
        };
        const createdUser = new UserSchema(newUser);
        const tokens = await JWTauthenticate(createdUser);
        createdUser.refreshToken = tokens.refreshToken;
        await createdUser.save();
        passNext(null, { tokens });
      } catch (error) {
        passNext(null, { error });
      }
    }
  }
);

passport.serializeUser(function (data, passNext) {
  passNext(null, data);
});

export default googleStrategy;
