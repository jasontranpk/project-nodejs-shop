const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

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
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
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
				isAuthenticated: req.session.isLoggedIn,
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
