const express = require('express')
const router = express.Router()
const stockController = require('../controllers/stocks')

router.get('/get-stock/', stockController.getStock)
router.get('/', (req, res) => {
	res.render('index')
})

module.exports = router
