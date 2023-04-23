// Modulos
const express = require('express')
const vouchers    = require('../components/vouchers/network')


//Logic
const routes = server =>{
    server.use('/generateVouchers',vouchers)

}

module.exports = routes
    