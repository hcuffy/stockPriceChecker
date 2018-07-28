//const axios = require('axios')
const Stock = require('../models/stock')

function updateLikes(res,ticker){
	Stock.findOneAndUpdate({ ticker: ticker }, { $inc: { likes: 1 } },{ new: true },
	 function (err, stock) {
			if (err) {
				return next(err)
			}
			res.send(stock)
		})

}
exports.getStock = (req, res, next) => {
	const { ticker , like } = req.query
	let userIP = req.connection.remoteAddress.replace(/^.*:/, '')
	let wasLiked = 0

	if (like == 'on'){
		wasLiked = 1
	}
	
	Stock.findOne({ ticker : ticker }, (err, stock) => {
		if (err) {
			console.log('here')
			return next(err)
		}
		if (stock == null){
			const newStock = new Stock({
      		ticker,
      		likes : wasLiked,
			   	userIP : [userIP]
      	})
			res.end('new stock added')
		} else if (!stock.userIP.includes(userIP)){



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
