// Modulos
const express = require('express')


// Logic
const router    = express.Router()

router.get('/',(req,res) =>{
    res.send('BILL 200 GET')
})

router.post('/',(req,res) =>{
    res.send('BILL 200 POS DATA: ')
})


module.exports = router