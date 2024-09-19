const authService = require("../../services/Auth/login");

async function login(req, res) {
  try {
    const { cred, Password } = req.body;
    const { token, refresh, found } = await authService.login(cred, Password);
    res.cookie("jwt", refresh, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    res.json({ user: found, accessToken: token, refreshToken: refresh });
  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
  }
}
module.exports = { login };
