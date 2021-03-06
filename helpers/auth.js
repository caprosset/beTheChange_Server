const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../models/user-model");
const Business = require("../models/business-model");

const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const authFields = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true,
};

passport.use(
  "signup",
  new localStrategy(
    authFields,
    // verify callback
    async (req, email, password, done) => {
      const {
        name,
        location,
        url,
        img,
        description,
        certifications,
        shipping,
        categories,
        tags,
      } = req.body.business;

    
      try {
        const userExist = await User.findOne({ email });
        if (userExist) {
          return done(null, false, {
            message: "Email already registered, log in instead.",
          });
        }
        // businesses:business
        const user = await User.create({ email, password });
        const userId = user._id;
        console.log("user_BODY:>>>>> ", user._id);
        // await Business.create(req.body.business, { owner:user._id });
        console.log("BUSINESS_BODY:>>>>> ", req.body.business);
        const business = new Business({
          name,
          location,
          url,
          img,
          description,
          certifications,
          shipping,
          categories,
          tags,
          owner: userId
        });
        await business.save();
        // await User.updateOne({_id: userId},{ $push: { businesses:business } });
        // const newUser = await User.findById(userId);
        // console.log("NEW_USER:>>>>> ", newUser)  
        // the verify callback invokes 'done' to supply Passport with the user that authenticated.
        console.log("User Registration succesful");
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(authFields, async (req, email, password, done) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done(null, false, { message: "User not found" });
      }

      const validate = await user.isValidPassword(password);

      if (!validate) {
        return done(null, false, { message: "Wrong Password" });
      }

      return done(null, user, { message: "Logged in Successfully" });
    } catch (error) {
      return done(error);
    }
  })
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: "TOP_SECRET",
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter("secret_token"),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
/**
 This code uses passport-jwt to extract the JWT from the query parameter. It then verifies that this token has been signed 
 with the secret or key set during logging in (TOP_SECRET). If the token is valid, the user details are passed to the next
middleware
 */
