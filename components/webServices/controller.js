/* Modulos */
const soap                     = require('soap')


/* Componets */
const { createXMl, singXml }   = require('../xml/controller')
const { URL }                  = require('./routes')




const invoiceData = async data =>{
    const xml  =  createXMl(data)
    const sing =  singXml(xml)
    let state = ''

    const send = {
        xml: Buffer.from(sing).toString('base64')
    }


    soap.createClient(URL.VALIDATE, (err,client) =>{
        if(err)
            console.error(err)
        
            client.validarComprobante(send,(err,res) =>{
                console.log('Validar comprobante')
                console.log(res)
            })

    })

    return sing
}


module.exports = {
    invoiceData
}