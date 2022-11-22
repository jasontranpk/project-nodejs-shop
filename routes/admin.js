const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post(
	'/add-product',
	isAuth,
	[
		body('title', 'Please enter a valid title')
			.trim()
			.isLength({ min: 3 })
			.isString()
			.notEmpty(),
		body('imageUrl', 'Please enter a valid image url').trim(),
		body('price', 'Please enter a valid price')
			.trim()
			.isNumeric()
			.notEmpty(),
		body('description', 'Please enter a valid description')
			.trim()
			.isLength({ min: 3, max: 400 }),
	],
	adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
	'/edit-product',
	isAuth,
	isAuth,
	[
		body('title', 'Please enter a valid title')
			.trim()
			.isLength({ min: 3 })
			.isString()
			.notEmpty(),
		body('price', 'Please enter a valid price')
			.trim()
			.isNumeric()
			.notEmpty(),
		body('description', 'Please enter a valid description')
			.trim()
			.isLength({ min: 3, max: 400 })
			.notEmpty(),
	],
	adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.deleteProduct);
// router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.get('/products', isAuth, adminController.getProducts);

exports.routes = router;
