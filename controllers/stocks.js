//const axios = require('axios')
const Stock = require('../models/stock')

exports.getStock = (req, res, next) => {
	let userIP = req.connection.remoteAddress.replace(/^.*:/, '')
	const { ticker , like } = req.body

	// let stock = 'FB'
	// axios({
	// 	method:'get',
	// 	url: 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol='+ stock + '&interval=1min&apikey='+ process.env.API_KEY,
	// 	responseType:'json'
	// })
	// 	.then(function(response) {
	//     	res.send(response.data)
	// 	})

}
