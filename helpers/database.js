const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
	MongoClient.connect(
		'mongodb+srv://admin:nodecomplete@cluster0.p0mjcad.mongodb.net/shop?retryWrites=true&w=majority'
	)
		.then((client) => {
			console.log('Connected!');
			_db = client.db();
			callback(client);
		})
		.catch((err) => {
			console.log(err);
			throw err;
		});
};

const getDb = () => {
	if (_db) {
		return _db;
	}
	throw 'No Database Found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
/* const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'wsl_root', 'myserver', {
	dialect: 'mysql',
	host: 'winhost',
	port: '3306',
});

module.exports = sequelize;
 */
