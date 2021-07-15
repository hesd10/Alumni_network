const User = require('../models/user');
const Alumni = require('../models/alumni');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

const parseReqForAlumni = (req) => {
    return alumni = {
        first_name: req.body.profile.first_name,
        last_name: req.body.profile.last_name,
        date_of_birth: {
            year: req.body.profile.dob.year,
            month: req.body.profile.dob.month,
            day: req.body.profile.dob.day,
        },
        hometown: {
            country: req.body.profile.hometown.country,
            state: req.body.profile.hometown.state,
            city: req.body.profile.hometown.city,
        },
        present_location: {
            country: req.body.profile.present.country,
            state: req.body.profile.present.state,
            city: req.body.profile.present.city,
        },
        present_job: {
            company: req.body.profile.job.company,
            position: req.body.profile.job.position,
        },
        is_married: (req.body.profile.ismarried === '1'),
        phone: req.body.profile.phone,
    };
};

const placeSchemaCompleter = async (country, state, city) => {
    if(country || state || city) {
        const geoData = await geocoder.forwardGeocode({
            query: city + ', ' + state + ', ' + country,
            limit: 1
        }).send();
        const {type, coordinates} = geoData.body.features[0].geometry;
        return [type, coordinates];
    } else {
        return ['Point', null];
    }
};

module.exports.sortAlumni = (a, b) => {
    const nameA = a.alumni.last_name.toUpperCase();
    const nameB = b.alumni.last_name.toUpperCase();
    if (nameA < nameB) {return -1;}
    if (nameA > nameB) {return 1;}
    return 0;
};

module.exports.mainPage = async (req, res) => {
    res.render('inConstruction');
};

module.exports.renderCreateProfile = async (req, res) => {
    // This can only be accessible when the user is logged in!
    try {
        user = await User.findOne({username: req.params.username});
        if(user && user.alumni) {
            req.flash('error', 'You have already created a profile!');
            return res.redirect(`/alumni/${req.params.username}`);
        } 
        res.render('alumni/createProfile', {user});
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/');
    }
};

module.exports.createProfile = async (req, res) => {
    try {
        const alumni = new Alumni(parseReqForAlumni(req));
        if(req.file) {
            alumni.image = {url: req.file.path, filename: req.file.filename};
        }
        if(alumni.present_location) {
            const {country, state, city} = alumni.present_location;
            [alumni.present_location.type, alumni.present_location.coordinates] = await placeSchemaCompleter(country, state, city);
        }
        if(alumni.hometown) {
            const {country, state, city} = alumni.hometown;
            [alumni.hometown.type, alumni.hometown.coordinates] = await placeSchemaCompleter(country, state, city);
        }
        await alumni.save();

        user = await User.findOneAndUpdate({username: req.params.username}, {alumni: alumni._id});
        req.flash('success', 'You have successfully create your profile!')
        return res.redirect(`/alumni/${req.params.username}`);
    } catch (e) {
       req.flash('error', e.message);
       return res.redirect('/')
    }
};

module.exports.renderUpdateProfile = async (req, res) => {
    // This can only be accessible when the user is logged in!
    try {
        user = await User.findOne({username: req.params.username});
        if(!user) {
            req.flash('error', 'You have not registered.  Please register!');
            return res.redirect('/register');
        } else if (!user.alumni){
            req.flash('error', 'You do not have a profile.  Please create a profile!');
            return res.redirect(`/alumni/${user.username}/createProfile`);
        } else {
            const userPopulated = await user.populate('alumni').execPopulate();
            res.render('alumni/updateProfile', {userPopulated});
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/');
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const parsedAlumni = parseReqForAlumni(req);
        user = await User.findOne({username: req.params.username});
        user.email = req.body.profile.email;
        await user.save();
        const alumni = await Alumni.findOneAndUpdate({_id: user.alumni}, parsedAlumni, {new: true});
        if(req.file) {
            await Alumni.findOneAndUpdate({_id: user.alumni}, {image: {url: req.file.path, filename: req.file.filename}});
        };
        // Interact with GeoBox.
        if(alumni.present_location) {
            const {country, state, city} = alumni.present_location;
            const [type, coordinates] = await placeSchemaCompleter(country, state, city);
            await Alumni.findOneAndUpdate({_id: user.alumni}, {'present_location.type': type, 'present_location.coordinates': coordinates});
        }
        if(alumni.hometown) {
            const {country, state, city} = alumni.hometown;
            const [type, coordinates] = await placeSchemaCompleter(country, state, city);
            await Alumni.findOneAndUpdate({_id: user.alumni}, {'hometown.type': type, 'hometown.coordinates': coordinates});
        }

        req.flash('success', 'You have successfully updated your profile!')
        return res.redirect(`/alumni/${req.params.username}`);
    } catch (e) {
       req.flash('error', e.message);
       return res.redirect('/')
    }
};

module.exports.renderProfile = async (req, res) => {
    // This can only be accessible when the user is logged in!
    try {
        const user = await User.findOne({username: req.params.username});
        if(!user) {
            req.flash('error', 'You have not registered.  Please register!');
            return res.redirect('/register');
        } else if (!user.alumni){
            req.flash('error', 'You do not have a profile.  Please create a profile!');
            return res.redirect(`/alumni/${user.username}/createProfile`);
        } else {
            const userPopulated = await user.populate('alumni').execPopulate();
            res.render('alumni/profile', {userPopulated});
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/');
    }
};

module.exports.renderChangePassword = async (req, res) => {
    try {
        user = await User.findOne({username: req.params.username});
        res.render('alumni/changePassword', {user});
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/');
    }
}

module.exports.changePassword = async (req, res) => {
    try {
        if(req.body.password1 !== req.body.password2) {
            req.flash('error', 'The passwords typed twice should be the same!')
            return res.redirect(`/alumni/${req.params.username}`);
        } else {
            User.findOne({username: req.params.username}).then((sanitizedUser) => {
                sanitizedUser.setPassword(req.body.password1, () => {
                    sanitizedUser.save();
                    req.flash('success', 'Your password has been successfully updated!  Please login again!')
                    req.logout();
                    return res.redirect('/');
                })
            }, (e) => {
                req.flash('error', e.message);
                return res.redirect(`/alumni/${req.params.username}`);
            });

        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/');
    }
}
