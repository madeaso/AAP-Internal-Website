module.exports = {
    // Add this to any route we want to protect.
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            if (!req.user.passwordReset) {
                return next();
            } else {
                req.flash('error_msg', 'Please reset your password to view this page');
                res.redirect('/users/reset-password');
            }
        } else {
            req.flash('error_msg', 'Please log in to view this page');
            res.redirect('/users/login');
        }
    },
    ensureAdmin: function (req, res, next) {
        if (req.isAuthenticated() && typeof req.user != 'undefined' && req.user.accountType == 'SystemAdmin') {
            return next();
        }
        req.flash('account_type_error', 'You do not have access to view this page');
        res.redirect('/dashboard');
    },
    ensureReset: function (req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.passwordReset) {
                return next();
            } else {
                req.flash('error_msg', 'Please contact a System Admin to reset your password');
                res.redirect('/dashboard');
            }
        } else {
            req.flash('error_msg', 'Please log in to view this page');
            res.redirect('/users/login');
        }
    }
}