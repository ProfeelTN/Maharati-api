var GoogleStrategy = require("passport-google-oauth20").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var GithubStrategy = require("passport-github2").Strategy;
var LinkedinStrategy = require("passport-linkedin-oauth2").Strategy;
const passport = require("passport");
const User = require("./src/models/user");
const { generateRefreshToken } = require("./src/utils/jwtUtils.js");
async function authenticateUser(profile, provider, cb) {
  try {
    const found = await User.findOne({ Email: profile.emails[0].value });
    let user;

    if (!found) {
      const newUser = new User({
        [`${provider}Id`]: profile.id,
        FirstName: profile.name.givenName,
        LastName: profile.name.familyName,
        Email: profile.emails[0].value,
        Status: true,
        Provider: provider,
      });
      const savedUser = await newUser.save();
      user = savedUser;
    } else if (found.Password) {
      throw new Error("Email in use");
    } else {
      user = found;
    }
    const refresh = generateRefreshToken(user);

    user.refreshToken = refresh;
    await user.save();

    return cb(null, { user, refreshToken: refresh });
  } catch (err) {
    console.log(err.message);
    return cb(err, null);
  }
}

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      await authenticateUser(profile, "Google", cb);
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.APP_ID,
      clientSecret: process.env.APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      await authenticateUser(profile, "Facebook", cb);
    }
  )
);

// Github Strategy
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: "/auth/github/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      await authenticateUser(profile, "Github", cb);
    }
  )
);

// LinkedIn Strategy
passport.use(
  new LinkedinStrategy(
    {
      clientID: process.env.LINKEDIN_ID,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: "/auth/linkedin/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      await authenticateUser(profile, "Linkedin", cb);
    }
  )
);
passport.serializeUser((data, done) => {
  done(null, data.user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
