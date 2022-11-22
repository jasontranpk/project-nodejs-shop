const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const User = require('./models/user');

require('dotenv').config();
const app = express();
const MONGODB_URI = process.env.MONGODB_URI;
const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions',
	//expire: 9000
});
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, new Date().toISOString() + '-' + file.originalname);
	},
});
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/gif' ||
		file.mimetype === 'image/webp'
	)
		cb(null, true);
	else cb(null, false);
};
const csrfProtection = csrf();
/* const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert'); */
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			'default-src': ["'self'"],
			'script-src': [
				"'self'",
				"'unsafe-inline'",
				'js.stripe.com',
				'https://checkout.stripe.com',
			],
			'style-src': [
				"'self'",
				"'unsafe-inline'",
				'fonts.googleapis.com',
				'https://checkout.stripe.com',
			],
			'frame-src': [
				"'self'",
				'js.stripe.com',
				'https://checkout.stripe.com',
			],
			'font-src': [
				"'self'",
				'fonts.googleapis.com',
				'fonts.gstatic.com',
				'https://checkout.stripe.com',
			],
		},
	})
);
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
	session({
		secret: 'my secret',
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

const accessLogStream = fs.createWriteStream(
	path.join(__dirname, 'access.log'),
	{ flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
app.use(csrfProtection);
app.use(flash());

/* app.use((req, res, next) => {
	res.removeHeader('Cross-Origin-Resource-Policy');
	res.removeHeader('Cross-Origin-Embedder-Policy');
	next();
}); */
app.use(compression());

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then((user) => {
			if (!user) {
				return next();
			}
			req.user = user;
			next();
		})
		.catch((err) => {
			next(new Error(err));
		});
});

app.use('/admin', adminData.routes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
	res.status(500).render('500', {
		pageTitle: 'Error',
		path: '/500',
		errorMessage: error,
		isAuthenticated: req.session.isLoggedIn,
	});
});

mongoose
	.connect(MONGODB_URI)
	.then(() => {
		/* 		https
			.createServer(
				{
					key: privateKey,
					cert: certificate,
				},
				app
			) */
		app.listen(process.env.PORT || 3000);
	})
	.catch();
