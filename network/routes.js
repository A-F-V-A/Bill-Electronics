// Modulos
const express = require('express')
const bill    = require('../components/bill/network')

//Logic
const routes = server =>{
    server.use('/bill',bill)
}

module.exports = routes
