const express = require('express');
const path = require('path');
const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteItem);

router.get('/orders', shopController.getOrders);
router.post('/create-order', shopController.postCheckout);

router.get('/products/:productId', shopController.getProduct);

module.exports = router;
