const { ObjectId } = require('mongodb');
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

/* const Sequelize = require('sequelize');

const sequelize = require('../helpers/database');

const Product = sequelize.define('product', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	title: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	price: {
		type: Sequelize.DOUBLE,
		allowNull: false,
	},
	imageUrl: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	description: {
		type: Sequelize.STRING,
		allowNull: false,
	},
}); */

module.exports = Product;
