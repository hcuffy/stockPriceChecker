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
	ticker.toUpperCase()
	
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
			let stockObject = response.data['Time Series (Daily)'][Object.keys(response.data['Time Series (Daily)'])[0]]
			let stockPrice = stockObject[Object.keys(stockObject)[3]].toString().slice(0, -2)
			Stock.find({ ticker : ticker }, (err, stock) => {
				if (err) {
					return next(err)
				}
	    res.render('single-stock', { stockPrice, stock })
			})
		})
}

function getTickerOneStock(tickerOne) {
	return axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ tickerOne + '&interval=1min&apikey='+ process.env.API_KEY)
}

function getTickerTwoStock(tickerTwo) {
	return axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ tickerTwo + '&interval=1min&apikey='+ process.env.API_KEY)
}

function difference (firstNumber, secondNumber){
	let theDifference = Math.abs(firstNumber - secondNumber)
	var likeOne, likeTwo
	if (firstNumber > secondNumber){
		 likeOne = Math.abs(firstNumber - secondNumber)
		 likeTwo = -Math.abs(firstNumber - secondNumber)

	 } else if (firstNumber < secondNumber){
		 likeOne = -Math.abs(firstNumber - secondNumber)
		 likeTwo = Math.abs(firstNumber - secondNumber)

	 } else {
		 likeOne = Math.abs(firstNumber - secondNumber)
		 likeTwo = Math.abs(firstNumber - secondNumber)

	 }

	 return ({ likeOne, likeTwo })
}

// TODO: Clean up thi function. API is not playing nice
function combineBothTickerStocks(res, tickerOne, tickerTwo ){
	axios.all([getTickerOneStock(tickerOne), getTickerTwoStock(tickerTwo)])
		.then(axios.spread( (tickerOneResponse, tickerTwoResponse) => {
			let timeSeriesStr ='Time Series (Daily)'
			let lastRefreshed = tickerOneResponse.data['Meta Data']['3. Last Refreshed']
			let stockPriceOne = tickerOneResponse.data[timeSeriesStr][lastRefreshed]['4. close']
			let stockPriceTwo = tickerTwoResponse.data[timeSeriesStr][lastRefreshed]['4. close']
			stockPriceOne = stockPriceOne.toString().slice(0, -2)
			stockPriceTwo = stockPriceTwo.toString().slice(0, -2)

			Stock.find({ $or: [ { ticker : tickerOne }, { ticker : tickerTwo } ] }, (err, stocks) => {
				if (err) {
					return next(err)
				}
				let diffLikes = difference(stocks[0].likes, stocks[1].likes)

	    res.render('double-stock', { stockPriceOne, stockPriceTwo, stocks, diffLikes })
			})

		}))
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
			combineBothTickerStocks(res,tickerOne, tickerTwo)

		} else if (stocks.length == 1 && !stocks[0].uniqueIP.includes(userIP) && wasLiked == true){
			updateWithLiked(res, stocks[0].ticker, userIP )
			let newTicker = stocks[0].ticker == tickerOne ? tickerTwo : tickerOne
		  createNewStock(newTicker, wasLiked , userIP)
			combineBothTickerStocks(res,tickerOne, tickerTwo)

		} else if (stocks.length == 2 && !stocks[0].uniqueIP.includes(userIP) && !stocks[1].uniqueIP.includes(userIP) && wasLiked == true){
			updateWithLiked(res, stocks[0].ticker, userIP )
			updateWithLiked(res, stocks[1].ticker, userIP )
			combineBothTickerStocks(res,tickerOne, tickerTwo)

		} else {
			combineBothTickerStocks(res,tickerOne, tickerTwo)

		}
	})
}
