const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user');

// const mongoConnect = require('./helpers/database').mongoConnect;

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	User.findById('6348d97da268fd0af42a6393')
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
});

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
	.connect(
		'mongodb+srv://admin:nodecomplete@cluster0.p0mjcad.mongodb.net/shop?retryWrites=true&w=majority'
	)
	.then(() => {
		User.findOne().then((user) => {
			if (!user) {
				const user = new User({
					name: 'Jason',
					email: 'jason@test.com',
					cart: {
						items: [],
					},
				});
				user.save();
			}
			app.listen(3000);
		});
	})
	.catch();
