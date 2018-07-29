const axios = require('axios')
const Stock = require('../models/stock')

function updateWithLiked(res, ticker, userIP, next){

	Stock.findOneAndUpdate({ ticker: ticker }, { $inc: { likes: 1 } , $push: { uniqueIP: userIP } },{ new: true },
	 function (err, stock) {
			if (err) {
				return next(err)
			}
			return
		})
}

function createNewStock(ticker, wasLiked , userIP){
	let addLike = 0
	var newIP

	if (wasLiked){
		addLike = 1
		newIP  = userIP
	}

	const newStock = new Stock({
		ticker,
		likes : addLike,
		uniqueIP : [newIP]
	})

	newStock.save(err => {
		if (err) {
	 return next(err)
		}
	})

}

function retrieveSingleStockPrice(res, ticker){
	axios({
		method:'get',
		url: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ ticker + '&interval=1min&apikey='+ process.env.API_KEY,
		responseType:'json'
	})
		.then(function(response) {
			let timeSeriesStr ='Time Series (Daily)'
			let lastRefreshed = response.data['Meta Data']['3. Last Refreshed']
			let stockPrice = response.data[timeSeriesStr][lastRefreshed]['4. close']
			stockPrice = stockPrice.toString().slice(0, -2)
			Stock.find({ ticker : ticker }, (err, stock) => {
				if (err) {
					return next(err)
				}
	    res.render('single-stock', { stockPrice, stock })
			})
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
			createNewStock(ticker, wasLiked , userIP)
			retrieveSingleStockPrice(res, ticker)

		} else if (!stock[0].uniqueIP.includes(userIP) && wasLiked == true){
			updateWithLiked(res, ticker, userIP )
			retrieveSingleStockPrice(res, ticker)

		} else {
			retrieveSingleStockPrice(res, ticker)

		}
	})
}


exports.getTwoStocks = (req, res, next) => {
	const { tickerOne, tickerTwo, likeBoth } = req.query
	let userIP = req.connection.remoteAddress.replace(/^.*:/, '')
	let wasLiked = false

	if (likeBoth == 'on'){
		wasLiked = true
	}

	Stock.find({ $or: [ { ticker : tickerOne }, { ticker : tickerTwo } ] }, (err, stocks) => {
		if (err) {
			return next(err)
		}

		if (stocks.length == 0 || stocks == null){

			createNewStock(tickerOne, wasLiked , userIP)
			createNewStock(tickerTwo, wasLiked , userIP)

			res.end('new stocks added')

		} else if (stocks.length == 1 && !stocks[0].uniqueIP.includes(userIP) && wasLiked == true){
			updateWithLiked(res, stocks[0].ticker, userIP )
			let newTicker = stocks[0].ticker == tickerOne ? tickerTwo : tickerOne
		  createNewStock(newTicker, wasLiked , userIP)
			res.end('ONe new added')
		} else if (stocks.length == 2 && !stocks[0].uniqueIP.includes(userIP) && !stocks[1].uniqueIP.includes(userIP) && wasLiked == true){
			updateWithLiked(res, stocks[0].ticker, userIP )
			updateWithLiked(res, stocks[1].ticker, userIP )
			res.end('liked two')
		} else {

			res.end('nothing to add')
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
