module.exports = {
    // Add this to any route we want to protect.
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view this page');
        res.redirect('/users/login');
    }
}