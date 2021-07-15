const Photo = require('../models/photo');
const PhotoComment = require('../models/photoComment');

module.exports.renderIndex = async (req, res) => {
    let photos = await Photo.find({}).populate('uploader');
    if (!req.user) {
        // Guest cannot access to the photos that only accessible to the alumni.
        photos = photos.filter((photo) => {
            return photo.accessibility === 'Global';
        });
    }
    res.render('photos/index', {photos});
};

module.exports.renderNewForm = async (req, res) => {
    res.render('photos/new');
};

module.exports.createPhoto = async (req, res) => {
    try {
        if(req.file) {
            const {description, accessibility} = req.body.photo;
            const photo = new Photo({description, accessibility});
            photo.image = {url: req.file.path, filename: req.file.filename};
            const uploader = await req.user.populate('alumni').execPopulate();
            photo.uploader = uploader.alumni._id;
            await photo.save();
            req.flash('success', 'The photo is successfully uploaded!')
            return res.redirect(`/photos`);
        } else {
            req.flash('error', 'You must select a photo!')
            return res.redirect(`/photos/new`);
        }
    } catch (e) {
       req.flash('error', e.message);
       return res.redirect('/photos')
    }
};

module.exports.showPhoto = async (req, res) => {
    const photo = await Photo.findById(req.params.photoID).populate('uploader').populate({
        path: 'comment_list',
        populate: {
            path: 'commenter'
        }
    });
    if (!photo) {
        req.flash('error', 'This photo does not exist!');
        return res.redirect('/photos');
    }
    if (!req.user && photo.accessibility === 'OnlyToAlumni') {
        req.flash('error', 'This photo is only accessible by the alumni!');
        return res.redirect('/photos');
    }
    res.render('photos/show', {photo});
};

module.exports.renderUpdatePhoto = async (req, res) => {
    const photo = await Photo.findById(req.params.photoID);
    if (!photo) {
        req.flash('error', 'This photo does not exist!');
        return res.redirect('/photos');
    }
    res.render('photos/edit', {photo});
};

module.exports.updatePhotoInfo = async (req, res) => {
    const photo = await Photo.findById(req.params.photoID);
    if (!photo) {
        req.flash('error', 'This photo does not exist!');
        return res.redirect('/photos');
    }
    try {
        await Photo.findByIdAndUpdate(req.params.photoID, req.body.photo);
        req.flash('success', 'The photo is successfully updated!')
        return res.redirect(`/photos/${req.params.photoID}`);
    } catch (e) {
       req.flash('error', e.message);
       return res.redirect('/photos')
    }
};

module.exports.deletePhoto = async (req, res) => {
    const photo = await Photo.findById(req.params.photoID);
    if (!photo) {
        req.flash('error', 'This photo does not exist!');
        return res.redirect('/photos');
    }
    try {
        await Photo.findByIdAndDelete(req.params.photoID, req.body.photo);
        req.flash('success', 'The photo is successfully deleted!')
        return res.redirect(`/photos`);
    } catch (e) {
       req.flash('error', e.message);
       return res.redirect('/photos')
    }
};

module.exports.createComment = async (req, res) => {
    try {
        const comment = new PhotoComment(req.body.comment);
        const photo = await Photo.findById(req.params.photoID);
        comment.commenter = req.user.alumni;
        photo.comment_list.push(comment._id);
        await comment.save();
        await photo.save();
        req.flash('success', 'You have successfully write your comment!')
        return res.redirect(`/photos/${req.params.photoID}`);
    } catch (e) {
       req.flash('error', e.message);
       return res.redirect('/')
    }
};

module.exports.deleteComment = async (req, res) => {
    try {
        const {photoID, commentID} = req.params;
        const photo = await Photo.findById(photoID);
        const comment = await PhotoComment.findById(commentID);
        if (!photo) {
            req.flash('error', 'This photo does not exist!') ;
            return res.redirect(`/photos}`);
        }
        if (!comment) {
            req.flash('error', 'This comment does not exist!') ;
            return res.redirect(`/photos/${req.params.photoID}`);
        } 
        if (!photo.comment_list.includes(commentID)) {
            req.flash('error', 'This comment is not for this photo!') ;
            return res.redirect(`/photos/${req.params.photoID}`);
        }
        await Photo.findByIdAndUpdate(photoID, {$pull: {comment_list: commentID}});
        await PhotoComment.findByIdAndDelete(commentID);
        req.flash('success', 'You have successfully delete your comment!')
        return res.redirect(`/photos/${req.params.photoID}`);
    } catch (e) {
       req.flash('error', e.message);
       return res.redirect('/')
    }
};