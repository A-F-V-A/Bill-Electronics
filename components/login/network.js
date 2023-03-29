// Modulos
const express    = require('express')
const controller = require('./controller')

// Logic
const router    = express.Router()

router.get('/',(req,res) =>{
    res.send('BILL 200 GET')
})


router.post('/', async (req,res) =>{
    
    res.send('post')
})


module.exports = router