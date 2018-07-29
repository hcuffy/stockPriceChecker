const express = require('express')
const router = express.Router()
const stockController = require('../controllers/stocks')

router.get('/stock-price/', stockController.getStock)
router.get('/stock-prices/', stockController.getTwoStocks)
router.get('/', (req, res) => {
	res.render('index')
})

module.exports = router
