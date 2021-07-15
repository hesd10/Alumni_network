const User = require('../models/user');
const VerifyCode = require('../models/verifyCode');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res) => {
    try {
        const verify_code = await VerifyCode.findOne({codes: req.body.verify_code});
        if(!verify_code) {
            req.flash('error', 'You do not have a verification code, or your verification code is wrong!');
            return res.redirect('/register')
        };
        // Verification code is correct.  Register.
        _ = await VerifyCode.findOneAndDelete({codes: req.body.verify_code});
        const {username, password, email} = req.body;
        const user = new User({username, email, privilege: 'Alumni'});

        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'You have successfully registered as alumni!  Please create your profile!')
            return res.redirect(`/alumni/${username}/createProfile`);
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    // The authentication is done in the controller.
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    return res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    return res.redirect('/');
};
