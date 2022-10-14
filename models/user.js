const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('./product');

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	cart: {
		items: [
			{
				productId: {
					type: Schema.Types.ObjectId,
					ref: 'Product',
					required: true,
				},
				quantity: { type: Number, required: true },
			},
		],
	},
});

userSchema.methods.clearCart = function () {
	this.cart.items = [];
	return this.save();
};

userSchema.methods.deleteItemFromCart = function (prodId) {
	const updatedCartItems = this.cart.items.filter((i) => {
		return i.productId.toString() !== prodId.toString();
	});
	this.cart.items = updatedCartItems;
	return this.save();
};

userSchema.methods.addToCart = function (product) {
	const cartProductIndex = this.cart.items.findIndex((cp) => {
		return cp.productId.toString() === product._id.toString();
	});
	let updatedCartItems = [...this.cart.items];
	if (cartProductIndex > -1) {
		let updatedQuantity = this.cart.items[cartProductIndex].quantity + 1;
		updatedCartItems[cartProductIndex].quantity = updatedQuantity;
	} else {
		updatedCartItems.push({
			productId: product._id,
			quantity: 1,
		});
	}
	const updatedCart = {
		items: updatedCartItems,
	};
	this.cart = updatedCart;
	return this.save();
};

module.exports = mongoose.model('User', userSchema);
/* const getDb = require('../helpers/database').getDb;
const { ObjectId } = require('mongodb');
class User {
	constructor(username, email, cart, userId) {
		this.name = username;
		this.email = email;
		this.cart = cart;
		this._id = userId;
	}

	save() {
		const db = getDb();
		return db
			.collection('users')
			.insertOne(this)
			.then((result) => {
				console.log('SAVED USER');
				return result;
			})
			.catch((err) => console.log(err));
	}

	addToCart(product) {
		const cartProductIndex = this.cart.items.findIndex((cp) => {
			return cp.productId.toString() === product._id.toString();
		});
		let updatedCartItems = [...this.cart.items];
		if (cartProductIndex > -1) {
			let updatedQuantity =
				this.cart.items[cartProductIndex].quantity + 1;
			updatedCartItems[cartProductIndex].quantity = updatedQuantity;
		} else {
			updatedCartItems.push({
				productId: new Object(product._id),
				quantity: 1,
			});
		}
		const updatedCart = {
			items: updatedCartItems,
		};
		const db = getDb();
		return db
			.collection('users')
			.updateOne(
				{ _id: new ObjectId(this._id) },
				{ $set: { cart: updatedCart } }
			);
	}

	deleteItemFromCart(prodId) {
		const updatedCartItems = this.cart.items.filter((i) => {
			return i.productId.toString() !== prodId.toString();
		});
		const updatedCart = {
			items: updatedCartItems,
		};
		const db = getDb();
		return db
			.collection('users')
			.updateOne(
				{ _id: new ObjectId(this._id) },
				{ $set: { cart: updatedCart } }
			);
	}

	getCart() {
		const db = getDb();
		const productIds = this.cart.items.map((item) => {
			return item.productId;
		});

		return db
			.collection('products')
			.find({ _id: { $in: productIds } })
			.toArray()
			.then((products) => {
				console.log(products);
				return products.map((p) => {
					return {
						...p,
						quantity: this.cart.items.find((i) => {
							return i.productId.toString() === p._id.toString();
						}).quantity,
					};
				});
			})
			.catch();
	}

	addOrder() {
		const db = getDb();
		return this.getCart().then((products) => {
			const order = {
				items: products,
				user: {
					_id: new ObjectId(this._id),
					name: this.name,
				},
			};
			return db
				.collection('orders')
				.insertOne(order)
				.then((result) => {
					this.cart = { items: [] };
					return db
						.collection('users')
						.updateOne(
							{ _id: this._id },
							{ $set: { cart: { items: [] } } }
						);
				});
		});
	}

	getOrders() {
		const db = getDb();
		return db
			.collection('orders')
			.find({ 'user._id': new ObjectId(this._id) })
			.toArray();
	}

	static findById(id) {
		const db = getDb();
		return db
			.collection('users')
			.findOne({ _id: new ObjectId(id) })
			.then((user) => {
				return user;
			})
			.catch((err) => console.log(err));
	}
}

module.exports = User;
 */
