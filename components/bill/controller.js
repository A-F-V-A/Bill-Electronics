/* Modules */
const { model }     = require('mongoose')
const { pdfBill }   = require('../pdf/controller')
const { invoiceData }   = require('../webServices/controller')

/* Logic */


const invoiceDatadd = (bill) =>{
    pdfBill(bill)
    return xlmBill(bill)    
}

module.exports = {
    invoiceData
}