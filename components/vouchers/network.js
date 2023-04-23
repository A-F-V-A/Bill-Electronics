const express    = require('express')
const controller = require('./controller')

// Logic
const router = express.Router()

router.post('/invoice', async (req,res) =>{
    res.type('application/xml');   
    res.send( await controller.resposeInvoice(req.body))
})


router.post('/withholdings', async (req,res) =>{
    res.type('application/xml');   
    res.send( await controller.resposeWithholdings(req.body))
})


router.post('/guides', async (req,res) =>{
    res.type('application/xml');   
    res.send( await controller.resposeGuides(req.body))
})


module.exports = router