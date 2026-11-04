export function requireLogin(req, res, next) {

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    
  if (!req.session.user) {
    return res.redirect("/login");
  }

  next();
}

export function requireRole(role) {
  return function (req, res, next) {

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    if (!req.session.user) {
      return res.redirect("/login");
    }

    if (req.session.user.role !== role) {
      return res.status(403).send("Access denied");
    }

    next();
  };
}
