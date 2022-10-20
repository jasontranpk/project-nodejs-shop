const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key:
				***REMOVED***,
		},
	})
);

exports.getLogin = (req, res, next) => {
	res.render('auth/login', {
		pageTitle: 'Login',
		path: '/login',
		errorMessage: req.flash('error'),
		validationErrors: [],
		oldInput: { email: '' },
	});
};
exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/login', {
			pageTitle: 'Login',
			path: '/login',
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
			oldInput: { email: email },
		});
	}
	User.findOne({ email: email }).then((user) => {
		if (!user) {
			return res.status(422).render('auth/login', {
				pageTitle: 'Login',
				path: '/login',
				errorMessage: 'Invalid email',
				validationErrors: [],
				oldInput: { email: email },
			});
		}
		bcrypt
			.compare(password, user.password)
			.then((doMatch) => {
				if (doMatch) {
					req.session.isLoggedIn = true;
					req.session.user = user;
					return req.session.save((err) => {
						console.log(err);
						res.redirect('/');
					});
				} else {
					req.flash('error', 'Invalid Password');
					return res.redirect('/login');
				}
			})
			.catch((err) => console.log(err));
	});
};
exports.postLogout = (req, res, next) => {
	req.session.destroy((err) => {
		res.redirect('/');
	});
};

exports.getSignup = (req, res, next) => {
	res.render('auth/signup', {
		pageTitle: 'Signup',
		path: '/signup',
		errorMessage: req.flash('error'),
		oldInput: { email: '' },
		validationErrors: [],
	});
};
exports.postSignup = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/signup', {
			pageTitle: 'Signup',
			path: '/signup',
			errorMessage: errors.array()[0].msg,
			oldInput: { email: email, password: password },
			validationErrors: errors.array(),
		});
	}
	return bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			const user = new User({
				email: email,
				password: hashedPassword,
				cart: { items: [] },
			});
			return user.save();
		})
		.then(() => {
			res.redirect('/login');
			return transporter.sendMail({
				to: email,
				from: 'jasontran.pk@gmail.com',
				subject: 'Signup succeeded',
				html: '<h1>You successfully signed up!</h1>',
			});
		});
};

exports.getReset = (req, res, next) => {
	res.render('auth/reset', {
		pageTitle: 'Reset Password',
		path: '/reset',
		errorMessage: req.flash('error'),
	});
};
exports.postReset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect('/reset');
		}
		const token = buffer.toString('hex');
		User.findOne({ email: req.body.email })
			.then((user) => {
				if (!user) {
					req.flash('error', 'No account with that email found.');
					return res.redirect('/reset');
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600000;
				return user.save();
			})
			.then((result) => {
				res.redirect('/');
				transporter.sendMail({
					to: req.body.email,
					from: 'jasontran.pk@gmail.com',
					subject: 'Password reset',
					html: `<p>You requested a password reset</p>
					<p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set  a new password</p>`,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	});
};

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;
	User.findOne({
		resetToken: token,
		resetTokenExpiration: { $gt: Date.now() },
	})
		.then((user) => {
			if (!user) {
				req.flash('error', 'token expired');
				return res.redirect('/login');
			}
			res.render('auth/new-password', {
				pageTitle: 'New Password',
				path: '/new-password',
				errorMessage: req.flash('error'),
				userId: user._id.toString(),
				passwordToken: token,
			});
		})
		.catch((err) => console.log(err));
};
exports.postNewPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const passwordToken = req.body.passwordToken;
	let resetUser;

	User.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId,
	})
		.then((user) => {
			resetUser = user;
			return bcrypt.hash(newPassword, 12);
		})
		.then((hashedPassword) => {
			resetUser.password = hashedPassword;
			resetUser.resetToken = undefined;
			resetUser.resetTokenExpiration = undefined;
			return resetUser.save();
		})
		.then(() => {
			res.redirect('/login');
		})
		.catch((err) => console.log(err));
};
