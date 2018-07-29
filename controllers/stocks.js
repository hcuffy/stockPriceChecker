//const axios = require('axios')
const Stock = require('../models/stock')

function updateWithLiked(res, ticker, userIP){

	Stock.findOneAndUpdate({ ticker: ticker }, { $inc: { likes: 1 } , $push: { uniqueIP: userIP } },{ new: true },
	 function (err, stock) {
			if (err) {
				return next(err)
			}
			res.send(stock)
			res.end()
		})
}
exports.getStock = (req, res, next) => {
	const { ticker , like } = req.query
	let userIP = req.connection.remoteAddress.replace(/^.*:/, '')
	let wasLiked = false

	if (like == 'on'){
		wasLiked = true
	}

	Stock.find({ ticker : ticker }, (err, stock) => {
		if (err) {
			return next(err)
		}

		if (stock.length == 0 || stock == null){

			const newStock = new Stock({
      		ticker,
      		likes : 1,
			   	uniqueIP : [userIP]
      	})

			newStock.save(err => {
				if (err) {
			 return next(err)
		 }
			})

			res.end('new stock added')

		} else if (!stock[0].uniqueIP.includes(userIP) && wasLiked == true){
			updateWithLiked(res, ticker, userIP )
			res.end('success')
		} else {
			res.end('success')
		}
	})

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
