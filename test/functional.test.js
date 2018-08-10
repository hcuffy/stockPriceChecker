const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = require('chai').assert
const server = require('../server')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

chai.use(chaiHttp)

describe('functional tests',  () => {
// it('should get the stock price', function (done) {
// 	this.timeout(4000)
// 	chai.request(server)
// 		.get('/stock-price/')
// 		.set('content-type', 'application/x-www-form-urlencoded')
// 		.query({ ticker : 'MSFT' })
// 		.end((err, res) => {
// 			const dom = new JSDOM(res.text)
// 			let output = dom.window.document.body.querySelector('.right-side').textContent
// 			assert.equal(res.status, 200)
// 			assert.isAtLeast(output.length, 6, 'output is greater or equal to 6')
// 			done()
// 		})
// })

	it('add stock with a like', function (done) {
		this.timeout(4000)
		chai.request(server)
			.get('/stock-price/')
			.set('content-type', 'application/x-www-form-urlencoded')
			.query({ ticker : 'MSFT' , like : 'on' })
			.end((err, res) => {
				const dom = new JSDOM(res.text)
				let output = dom.window.document.body.querySelector('#likesId').textContent.slice(-1)
				assert.equal(res.status, 200)
				assert.equal(output, 1)
				done()
			})
	})



})
