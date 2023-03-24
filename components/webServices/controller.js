/* Modulos */
const soap                     = require('soap')


/* Componets */
const { createXMl, singXml }   = require('../xml/controller')
const { URL }                  = require('./routes')




const invoiceData = async data =>{
    const [xml, key]  =  createXMl(data)
    const sing =  singXml(xml)

    console.log(sing)
    
    let state = ''

    const send = {
        xml: Buffer.from(sing).toString('base64')
    }


     soap.createClient(URL.VALIDATE, async (err,client) =>{
        if(err)
            console.error(err)
        
        await client.validarComprobante(send, (err,res) =>{
            console.log('Validar comprobante')
            console.log(res)

            let { estado } = res.RespuestaRecepcionComprobante
console.log(estado)
            if(estado == 'RECIBIDA'){
                const sendR = {
                    claveAccesoComprobante:key.toString()
                }
                soap.createClient(URL.ACTORIZE, async (errTwo,clientTwo)=>{
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