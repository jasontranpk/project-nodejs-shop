const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);
router.post(
	'/login',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email address'),
		body('password', 'Your password is not correct')
			.isLength({ min: 6 })
			.isAlphanumeric()
			.trim(),
	],
	authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
router.post(
	'/signup',
	[
		check('email')
			.isEmail()
			.withMessage('Please enter a valid email!')
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((user) => {
					if (user) {
						return Promise.reject(
							'Email exists already, please pick a different one.'
						);
					}
				});
			})
			.normalizeEmail({ gmail_remove_dots: false }),
		body(
			'password',
			'Please enter a password with only numbers and text and at least 5 characters'
		)
			.isLength({ min: 6 })
			.isAlphanumeric()
			.trim(),
		body('confirmPassword')
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Passwords have to match!');
				}
				return true;
			})
			.trim(),
	],
	authController.postSignup
);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
