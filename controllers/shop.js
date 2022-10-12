const Product = require('../models/product');

// const Cart = require('../models/cart');
// const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
	Product.fetchAll()
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
	Product.fetchAll()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
			});
		})
		.catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	console.log(prodId);
	Product.findById(prodId)
		.then((product) => {
			res.render('shop/product-detail', {
				pageTitle: product.title,
				product: product,
				path: '/product-detail',
			});
		})
		.catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	console.log(prodId);
	Product.findById(prodId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then((result) => {
			console.log(result);
			res.redirect('/cart');
		});
};

exports.getCart = (req, res, next) => {
	req.user
		.getCart()
		.then((products) => {
			console.log(products);
			res.render('shop/cart', {
				pageTitle: 'Your Cart',
				path: '/cart',
				products: products,
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

exports.postCheckout = (req, res, next) => {
	req.user
		.addOrder()
		.then(() => res.redirect('/orders'))
		.catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
	req.user.getOrders().then((orders) => {
		res.render('shop/orders', {
			pageTitle: 'Your Orders',
			path: '/orders',
			orders: orders,
		});
	});
};
/* 




exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	let fetchedCart;
	let newQuantity;
	req.user
		.getCart()
		.then((cart) => {
			fetchedCart = cart;
			return cart.getProducts({ where: { id: prodId } });
		})
		.then((products) => {
			let product;
			if (products.length > 0) {
				product = products[0];
			}
			newQuantity = 1;
			if (product) {
				const oldQuantity = product.cartItem.quantity;
				newQuantity = oldQuantity + 1;
				return product;
			}
			return Product.findByPk(prodId);
		})
		.then((product) => {
			return fetchedCart.addProduct(product, {
				through: { quantity: newQuantity },
			});
		})
		.then(() => res.redirect('/cart'))
		.catch((err) => console.log(err));
};

exports.postCartDeleteItem = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.getCart()
		.then((cart) => {
			return cart.getProducts({ where: { id: prodId } });
		})
		.then(([product]) => {
			return product.cartItem.destroy();
		})
		.then(() => res.redirect('/cart'))
		.catch((err) => console.log(err));
};



exports.getCheckout = (req, res, next) => {
	res.render('shop/checkout', {
		pageTitle: 'Checkout',
		path: '/checkout',
	});
};

 */
