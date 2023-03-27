/* Modulos */
const soap = require('soap')

/* Componets */
const { URL }                  = require('./routes')
const { createXMl, singXml }   = require('../xml/controller')
const { pdfBill }              = require('../pdf/controller')

const invoiceData = async data =>{
    const [xml, key]  =  createXMl(data)
    const sing =  await singXml(xml,'../../ANDRES_PAUL_JARAMILLO_VACA_270622123005.p12','13061994')

    const send = {
        xml: Buffer.from(sing).toString('base64') 
    }

    soap.createClient(URL.VALIDATE, async (err,client) =>{
        if(err)
            console.error(err)
        
        await client.validarComprobante(send, async (err,res) =>{
            console.log('Validar comprobante')
            console.log(res, res.RespuestaRecepcionComprobante.comprobante?.comprobante)

            let { estado } = res.RespuestaRecepcionComprobante
            console.log(estado)
            if(estado == 'RECIBIDA'){
                const sendR = {
                    claveAccesoComprobante:key.toString()
                }
                soap.createClient(URL.AUTHORIZE, async (errTwo,clientTwo)=>{
                    if(errTwo)
                        console.error(errTwo)
                    await clientTwo.autorizacionComprobante(sendR,(twoErr,resTwo) =>{
                        console.log('Autorizar comprobante')
                        if(twoErr)
                            console.error(twoErr)
                        console.log(resTwo.RespuestaAutorizacionComprobante.autorizaciones.autorizacion)
                    })  
                })
            }
    
        })

    })

    await pdfBill(data)
    return sing
}


module.exports = {
    invoiceData
}