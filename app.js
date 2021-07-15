if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const path = require('path');

const User = require('./models/user');
const Alumni = require('./models/alumni');

const userRoutes = require('./routes/users');
const alumniRoutes = require('./routes/alumni');
const contactRoutes = require('./routes/contact');
const photoRoutes = require('./routes/photo');

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoDBStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// Global variables (will be moved in environmental variables later).
const secret = process.env.SECRET;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/alumniWebsite'

// Mongoose
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('database connected');
});

// Express.js
const app = express();

// View engine: ejs.
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parser, method override, and static folder configuration.
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

// Store sessions in MongoDB. 
const store = new MongoDBStore({
    mongoUrl: dbUrl,
    crypto: {
        secret
    },
    touchAfter: 24 * 3600
});

store.on('error', function(e) {
    console.log("Session store error", e);
});

// Sessions.
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7*86400*1000,
        maxAge: 7*86400*1000
    }
};
app.use(session(sessionConfig));

// Flash.
app.use(flash());

// Passport.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Helmet.
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/hesd10/",
                "https://images.unsplash.com/",
                "upload.wikimedia.org",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Local variables setup.
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', userRoutes);
app.use('/alumni', alumniRoutes);
app.use('/contact', contactRoutes);
app.use('/photos', photoRoutes);

app.get('/introduction', async (req, res) => {
    res.render('inConstruction');
});
app.get('/forum', async (req, res) => {
    res.render('inConstruction');
});

app.get('/', async (req, res) => {
    let alumniAll = await Alumni.find({});
    alumniAll = alumniAll.map(function(elm) {
        let {present_location, popUpMarkup} = elm; 
        let {type, coordinates} = present_location;
        return {geometry: {type, coordinates}, properties: {popUpMarkup}};
    });
    alumniAll = alumniAll.filter(function (elm) {
        return elm.geometry.coordinates
    }) 
    alumniAll = {features: alumniAll};
    res.render('home', {alumniAll});
});

app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
});

// Error handler.
app.use((err, req, res, next) => {
   const {statusCode = 500} = err;
   if(!err.message) err.message = 'Oh no, something went wrong!';
   res.status(statusCode).render('err', {err});
});

const port = process.env.PORT || 13030;

// Begin listening.
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});