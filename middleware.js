const User = require('./models/user');
const Alumni = require('./models/alumni');
const Photo = require('./models/photo');
const PhotoComment = require('./models/photoComment');
const expressError = require('./utils/ExpressError');
const { alumniSchema, photoSchema, photoCommentSchema } = require('./schemas');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAlumni = (req, res, next) => {
    if(!(req.isAuthenticated() && (req.user.privilege === 'Alumni'))) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be alumni to visit this!');
        return res.redirect('/login');
    }
    next();
}

// Not used for now, because all logged-in users must be alumni.
// Reserved for future when there may be other kinds of users.
module.exports.isAlumniWithProfile = (req, res, next) => {
    if(!(req.isAuthenticated() && (req.user.privilege === 'Alumni'))) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be alumni to visit this!');
        return res.redirect('/login');
    } else if(req.user.alumni === null) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You have not create your profile. Please create profile first!');
        return res.redirect(`/alumni/${req.user.username}/createProfile`);
    }
    next();
}

module.exports.isAuthor = (req, res, next) => {
    const {username} = req.params;
    if(username !== req.user.username) {
        req.flash('error', 'It is not your private space!  Redirect you to your own space!');
        return res.redirect(`/alumni/${req.user.username}`);
    };
    next();
}

module.exports.isPhotoAuthor = async (req, res, next) => {
    const {photoID} = req.params;
    photo = await Photo.findById(photoID);
    if(photo.uploader.toString() !== req.user.alumni.toString()) {
        req.flash('error', 'You are not the author of this photo!');
        return res.redirect(`/photos/${req.params.photoID}`);
    };
    next();
}

module.exports.isPhotoCommentAuthor = async (req, res, next) => {
    const {photoID, commentID} = req.params;
    comment = await PhotoComment.findById(commentID);
    if(comment.commenter.toString() !== req.user.alumni.toString()) {
        req.flash('error', 'You are not the author of this comment!');
        return res.redirect(`/photos/${req.params.photoID}`);
    };
    next();
}

module.exports.validateProfile = (req, res, next) => {
    const {error} = alumniSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validatePhotoInfo = (req, res, next) => {
    const {error} = photoSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validatePhotoComment = (req, res, next) => {
    const {error} = photoCommentSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400);
    } else {
        next();
    }
}