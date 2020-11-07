var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.userContext && req.userContext.userinfo) {
        res.redirect('/play');
    }
    res.render('index');
});

module.exports = router;
