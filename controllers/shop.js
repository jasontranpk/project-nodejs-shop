const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'My Shop',
				path: '/',
			});
		})
		.catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	/* 	if (!mongoose.isValidObjectId(prodId)) {
		console.log('returned');
		return res.redirect('/');
	} */
	return Product.findById(prodId)
		.then((product) => {
			console.log('rendered');
			return res.render('shop/product-detail', {
				pageTitle: product.title,
				product: product,
				path: '/product-detail',
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then((result) => {
			res.redirect('/cart');
		});
};

exports.getCart = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.then((user) => {
			const products = user.cart.items;
			res.render('shop/cart', {
				pageTitle: 'Your Cart',
				path: '/cart',
				products: products,
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.postCartDeleteItem = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.deleteItemFromCart(prodId)
		.then(() => res.redirect('/cart'))
		.catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
	req.user.populate('cart.items.productId').then((user) => {
		const products = user.cart.items.map((p) => {
			return {
				product: { ...p.productId._doc },
				quantity: p.quantity,
			};
		});
		const order = new Order({
			items: products,
			user: {
				userId: req.user.id,
				email: req.user.email,
			},
		});
		order
			.save()
			.then(() => {
				req.user.clearCart().then(() => {
					res.redirect('/orders');
				});
			})
			.catch((err) => console.log(err));
	});
};

exports.getOrders = (req, res, next) => {
	Order.find({ 'user.userId': req.user._id }).then((orders) => {
		res.render('shop/orders', {
			pageTitle: 'Your Orders',
			path: '/orders',
			orders: orders,
		});
	});
};
