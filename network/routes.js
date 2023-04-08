// Modulos
const express = require('express')
const bill    = require('../components/bill/network')
//const login    = require('../components/login/controller')

//Logic
const routes = server =>{
    server.use('/xmlGenereteBill',bill)
 //   server.use('/login',login)
}

module.exports = routes
    