const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.role) return res.sendStatus(401);
    const rolesArray = [...allowedRoles];
    const result = rolesArray.includes(req.role);
    if (!result) return res.sendStatus(401);
    next();
  };
};
const ROLES = { ADMIN: "Admin", INSTRUCTOR: "Instructor", User: "User" };

module.exports = { verifyRole, ROLES };
