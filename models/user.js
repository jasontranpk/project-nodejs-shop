const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	resetToken: String,
	resetTokenExpiration: Date,
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
