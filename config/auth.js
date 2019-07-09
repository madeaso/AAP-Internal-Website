module.exports = {
    // Add this to any route we want to protect.
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view this page');
        res.redirect('/users/login');
    },
    ensureAdmin: function (req, res, next) {
        if (req.isAuthenticated() && typeof req.user != 'undefined' && req.user.accountType == 'SystemAdmin') {
            return next();
        }
        req.flash('account_type_error', 'You do not have access to view this page');
        res.redirect('/dashboard');
    }
}