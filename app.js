const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user');
/* const sequelize = require('./helpers/database');
const Product = require('./models/product');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item'); */

const mongoConnect = require('./helpers/database').mongoConnect;

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	User.findById('63462204cf9d8efcad0d4922')
		.then((user) => {
			req.user = new User(user.name, user.email, user.cart, user._id);
			next();
		})
		.catch((err) => {
			console.log(err);
		});
});

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect((client) => {
	User.findById('63462204cf9d8efcad0d4922').then((u) => {
		if (u) {
			app.listen(3000);
		} else {
			u = new User('admin', 'admin@test.com');
			u.save().then(() => {
				app.listen(3000);
			});
		}
	});
});
