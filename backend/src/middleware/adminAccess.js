const requireSuperuser = (req, res, next) => {
  if (req.user?.role !== "superuser") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

module.exports = { requireSuperuser };
