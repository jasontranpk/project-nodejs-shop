const Product = require('../models/product');
const { validationResult } = require('express-validator');
exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		oldInput: {},
		errorMessage: [],
		hasError: false,
		validationErrors: [],
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const description = req.body.description;
	const price = req.body.price;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			errorMessage: errors.array()[0].msg,
			hasError: true,
			validationErrors: errors.array(),
			product: {
				title: title,
				imageUrl: imageUrl,
				price: price,
				description: description,
			},
		});
	}
	const product = new Product({
		title,
		price,
		description,
		imageUrl,
		userId: req.session.user,
	});
	product
		.save()
		.then(() => {
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch((err) => {
			/* 			return res.status(500).render('admin/edit-product', {
				pageTitle: 'Add Product',
				path: '/admin/add-product',
				editing: false,
				errorMessage: 'Database operation failed, please try again',
				hasError: true,
				validationErrors: errors.array(),
				product: {
					title: title,
					imageUrl: imageUrl,
					price: price,
					description: description,
				},
			}); */
			// return res.redirect('/500');
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProducts = (req, res, next) => {
	Product.find({ userId: req.user._id })
		// .select('title price -_id')
		// .populate('userId', 'name')
		.then((products) => {
			res.render('admin/product-list', {
				prods: products,
				pageTitle: 'Admin Product',
				path: '/admin/products',
			});
		});
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	const prodId = req.params.productId;
	if (!editMode) {
		return res.redirect('/');
	}
	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product: product,
				errorMessage: [],
				hasError: false,
				validationErrors: [],
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedImageUrl = req.body.imageUrl;
	const updatedPrice = req.body.price;
	const updatedDescription = req.body.description;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			errorMessage: errors.array()[0].msg,
			hasError: true,
			product: {
				title: updatedTitle,
				imageUrl: updatedImageUrl,
				price: updatedPrice,
				description: updatedDescription,
				_id: prodId,
			},
			validationErrors: errors.array(),
		});
	}
	Product.findById(prodId)
		.then((product) => {
			if (product.userId.toString() !== req.user._id.toString()) {
				return res.redirect('/');
			}
			product.title = updatedTitle;
			product.imageUrl = updatedImageUrl;
			product.price = updatedPrice;
			product.description = updatedDescription;
			return product.save().then(() => {
				console.log('Updated Product');
				res.redirect('/admin/products');
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	Product.deleteOne({ _id: prodId, userId: req.user._id }).then(() => {
		res.redirect('/admin/products');
	});
};
