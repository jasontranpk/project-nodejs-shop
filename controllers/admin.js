const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const description = req.body.description;
	const price = req.body.price;
	const product = new Product(
		title,
		price,
		description,
		imageUrl,
		req.user._id
	);
	product
		.save()
		.then(() => {
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
	Product.fetchAll().then((products) => {
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
	Product.findById(prodId).then((product) => {
		if (!product) {
			return res.redirect('/');
		}
		res.render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: editMode,
			product: product,
		});
	});
};

exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedImageUrl = req.body.imageUrl;
	const updatedPrice = req.body.price;
	const updatedDescription = req.body.description;
	const product = new Product(
		updatedTitle,
		updatedPrice,
		updatedDescription,
		updatedImageUrl
	);
	console.log(product);
	product
		.save(prodId)
		.then(() => {
			console.log('Updated Product');
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	console.log(prodId);
	Product.deleteById(prodId).then(() => {
		res.redirect('/admin/products');
	});
};
