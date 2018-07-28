const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StockSchema = new Schema(
	{
		ticker: String,
		likes: String,
		uniqueIP: []
	},
	{ timestamps: true }
)

const ModelClass = mongoose.model('stock', StockSchema)
module.exports = ModelClass
