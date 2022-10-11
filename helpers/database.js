const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'wsl_root', 'myserver', {
	dialect: 'mysql',
	host: 'winhost',
	port: '3306',
});

module.exports = sequelize;
