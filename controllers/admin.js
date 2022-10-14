const product = require('../models/product');
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
	const product = new Product({
		title,
		price,
		description,
		imageUrl,
		userId: req.user,
	});
	product
		.save()
		.then(() => {
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
	Product.find()
		// .select('title price -_id')
		// .populate('userId', 'name')
		.then((products) => {
			console.log(products);
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

	Product.findById(prodId)
		.then((product) => {
			product.title = updatedTitle;
			product.imageUrl = updatedImageUrl;
			product.price = updatedPrice;
			product.description = updatedDescription;
			return product.save();
		})
		.then(() => {
			console.log('Updated Product');
			res.redirect('/admin/products');
		});
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findByIdAndRemove(prodId).then(() => {
		res.redirect('/admin/products');
	});
};
