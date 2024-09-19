const passport = require("passport");
function handleAuthCallback(strategyName) {
  return (req, res, next) => {
    passport.authenticate(strategyName, (err, data, info) => {
      if (err) {
        return res.redirect(
          process.env.CLIENT_URL + "/login?error=email_error"
        );
      }
      if (!data) {
        return res.redirect(
          process.env.CLIENT_URL + "/login?error=authentication_failed"
        );
      }

      const { refreshToken } = data;

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });

      const from = req.session.from || "/";
      return res.redirect(
        process.env.CLIENT_URL + `/${strategyName}/oauth?from=${from}`
      );
    })(req, res, next);
  };
}
module.exports = { handleAuthCallback };
