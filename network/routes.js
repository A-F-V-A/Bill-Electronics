// Modulos
const express = require('express')
const bill    = require('../components/bill/network')
const usersRoutes = require( "../components/login/src/routes/user.routes");
const authRoutes =require( "../components/login/src/routes/auth.routes")
const verifyToken = require("../components/login/src/middlewares/authJwt");

//Logic
const routes = server =>{
    server.use('/xmlGenereteBill',verifyToken, bill)
     // Routes login
    server.use("/api/users", usersRoutes);
    server.use("/api/auth", authRoutes);
}

module.exports = routes
    