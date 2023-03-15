// Modulos
const express = require('express')

const controller = require('./controller')



// Logic
const router    = express.Router()

router.get('/',(req,res) =>{
    res.send('BILL 200 GET')
})


router.post('/',(req,res) =>{
   // console.log(req.body)
    res.type('application/xml');
    
    res.send(controller.invoiceData(req.body))
})


module.exports = router