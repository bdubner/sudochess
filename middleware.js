const auth = require("./auth");


// Tack a user object onto each request if possible
function addUser(req, res, next) {
    if (!req.userContext || !req.userContext.userinfo) {
        console.log("no userinfo")
        return next();
    }

    auth.oktaClient.getUser(req.userContext.userinfo.sub)
        .then(user => {
            req.user = user;
            res.locals.user = user;
            console.log("appending user " + user.profile.login)
            next();
        }).catch(err => {
        next(err);
    });
};


// Only let the user access the route if they are authenticated.
function loginRequired(req, res, next) {
    if (!req.user) {
        return res.status(401).render("unauthenticated");
    }

    next();
}


module.exports = { addUser, loginRequired };