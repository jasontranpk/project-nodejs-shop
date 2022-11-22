const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 6;

exports.getIndex = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;

	Product.find()
		.countDocuments()
		.then((numProducts) => {
			totalItems = numProducts;
			return Product.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'My Shop',
				path: '/',
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProducts = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;

	Product.find()
		.countDocuments()
		.then((numProducts) => {
			totalItems = numProducts;
			return Product.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Products',
				path: '/products',
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	/* 	if (!mongoose.isValidObjectId(prodId)) {
		console.log('returned');
		return res.redirect('/');
	} */
	return Product.findById(prodId)
		.then((product) => {
			return res.render('shop/product-detail', {
				pageTitle: product.title,
				product: product,
				path: '/product-detail',
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then((result) => {
			res.redirect('/cart');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
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
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postCartDeleteItem = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.deleteItemFromCart(prodId)
		.then(() => res.redirect('/cart'))
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCheckout = (req, res, next) => {
	let products;
	let total = 0;

	req.user
		.populate('cart.items.productId')
		.then((user) => {
			products = user.cart.items;
			products.forEach((p) => {
				total += p.productId.price * p.quantity;
			});

			return stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: products.map((p) => {
					return {
						price_data: {
							currency: 'usd',
							product_data: {
								name: p.productId.title,
								description: p.productId.description,
							},
							unit_amount: p.productId.price * 100,
						},
						quantity: p.quantity,
					};
				}),
				mode: 'payment',
				success_url:
					req.protocol +
					'://' +
					req.get('host') +
					'/checkout/success',
				cancel_url:
					req.protocol + '://' + req.get('host') + '/checkout/cancel',
			});
		})
		.then((session) => {
			res.render('shop/checkout', {
				pageTitle: 'Checkout',
				path: '/cart',
				products: products,
				totalSum: total,
				sessionId: session.id,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.postOrder = (req, res, next) => {
	const token = req.body.stripeToken;
	let totalSum = 0;
	req.user
		.populate('cart.items.productId')
		.then((user) => {
			user.cart.items.forEach((p) => {
				totalSum += p.quantity * p.productId.price;
			});
			const products = user.cart.items.map((i) => {
				return {
					quantity: i.quantity,
					product: { ...i.productId._doc },
				};
			});
			const order = new Order({
				user: {
					email: req.user.email,
					userId: req.user,
				},
				items: products,
			});
			return order.save();
		})
		.then((result) => {
			const charge = stripe.charges.create({
				amount: totalSum * 100,
				currency: 'usd',
				description: 'Demo Order',
				source: token,
				metadata: { order_id: result._id.toString() },
			});
			return req.user.clearCart();
		})
		.then(() => {
			res.redirect('/orders');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.getCheckoutSuccess = (req, res, next) => {
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
			.catch((err) => {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	});
};

exports.getOrders = (req, res, next) => {
	Order.find({ 'user.userId': req.user._id })
		.then((orders) => {
			res.render('shop/orders', {
				pageTitle: 'Your Orders',
				path: '/orders',
				orders: orders,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getInvoice = (req, res, next) => {
	const orderId = req.params.orderId;
	Order.findById(orderId)
		.then((order) => {
			if (!order) {
				return next(new Error('no order found'));
			}
			if (order.user.userId.toString() !== req.user._id.toString()) {
				return next(new Error('Unauthorized'));
			}
			const invoiceName = 'invoice' + orderId + '.pdf';
			const invoicePath = path.join('data', 'invoices', invoiceName);

			const pdfDoc = new PDFDocument();
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader(
				'Content-Disposition',
				'inline; filename="' + invoiceName + '"'
			);
			pdfDoc.pipe(fs.createWriteStream(invoicePath));
			pdfDoc.pipe(res);

			pdfDoc.fontSize(26).text('Invoice', { underline: true });
			pdfDoc.text('--------------------');
			let totalPrice = 0;
			order.items.forEach((p) => {
				totalPrice += p.quantity * p.product.price;
				pdfDoc
					.fontSize(14)
					.text(
						p.product.title +
							' - ' +
							p.quantity +
							' x ' +
							'$' +
							p.product.price
					);
			});
			pdfDoc.text('--------------------');
			pdfDoc.fontSize(20).text(`Total price: ${totalPrice}`);
			pdfDoc.end();
			/* 			fs.readFile(invoicePath, (err, data) => {
				if (err) {
					console.log(err);
					return next(err);
				}
				res.setHeader('Content-Type', 'application/pdf');
				res.setHeader(
					'Content-Disposition',
					'inline; filename="' + invoiceName + '"'
				);
				res.send(data);
			}); */
		})
		.catch((err) => next(err));
};
