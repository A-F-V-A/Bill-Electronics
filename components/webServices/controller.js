/* Modulos */
const soap                     = require('soap')


/* Componets */
const { createXMl, singXml }   = require('../xml/controller')
const { URL }                  = require('./routes')




const invoiceData = async data =>{
    const [xml, key]  =  createXMl(data)
    const sing =  singXml(xml)

    
    let state = ''

    const send = {
        xml: Buffer.from(sing).toString('base64') //Buffer.from(sing).toString('base64')
    }


    await soap.createClient(URL.VALIDATE, async (err,client) =>{
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
                await soap.createClient(URL.AUTHORIZE, async (errTwo,clientTwo)=>{
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

    return sing
}


module.exports = {
    invoiceData
}