const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	price: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
});

module.exports = mongoose.model('Product', productSchema);
/* const { ObjectId } = require('mongodb');
const getDb = require('../helpers/database').getDb;

class Product {
	constructor(title, price, description, imageUrl, userId) {
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
		this.userId = userId;
	}

	save(id) {
		const db = getDb();
		if (id) {
			return db
				.collection('products')
				.updateOne({ _id: new ObjectId(id) }, { $set: this })
				.then((result) => console.log(result))
				.catch((err) => console.log(err));
		} else {
			return db
				.collection('products')
				.insertOne(this)
				.then((result) => console.log(result))
				.catch((err) => console.log(err));
		}
	}
	static fetchAll() {
		const db = getDb();
		return db
			.collection('products')
			.find()
			.toArray()
			.then((products) => {
				return products;
			})
			.catch((err) => console.log(err));
	}
	static findById(id) {
		const db = getDb();
		return db
			.collection('products')
			.findOne({ _id: new ObjectId(id) })
			.catch((err) => console.log(err));
	}
	static deleteById(id) {
		const db = getDb();
		return db
			.collection('products')
			.deleteOne({ _id: new ObjectId(id) })
			.then((result) => {
				console.log(result);
				console.log('product destroyed');
			})
			.catch((err) => console.log(err));
	}
}

module.exports = Product;
 */
