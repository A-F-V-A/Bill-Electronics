//DEV
if(process.env.NODE_ENV !== 'production')
    require('dotenv').config()

// Modulos
const express    = require('express')
const bodyParser = require('body-parser')
const router     = require('./network/routes')
const layouts    = require('express-ejs-layouts')

// Logic

const app = express()

app.use(layouts)
app.use(bodyParser.json())
app.use('/app',express.static('public'))
router(app)

//Init Server 
const PORT = process.env.PORT || 3000
app.listen(PORT)
console.log(`Server development: http://localhost:${PORT}`)
