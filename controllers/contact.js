const User = require('../models/user');
const Alumni = require('../models/alumni');
const alumniController = require('./alumni.js');

module.exports.renderContactTable = async (req, res) => {
    // This can only be accessible when the user is logged in!
    try {
        const usersPopulated = await User.find({alumni: {$ne: null}}).populate('alumni');
        // Following is an alternative way to populate a list of objects.
        // const users = await User.find({});
        // const usersPopulated = await Promise.all(users.map(x => x.populate('alumni')));
        usersPopulated.sort(alumniController.sortAlumni);
        res.render('contact/contactTable', {usersPopulated});
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/');
    }
};