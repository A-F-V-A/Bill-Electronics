/* Modulos */
const soap = require('soap')

/* Componets */
const { URL }                  = require('./routes')
const { createXMl, singXml }   = require('../xml/controller')
const { pdfBill }              = require('../pdf/controller')

const invoiceData = async data =>{
    const [xml, key]  =  createXMl(data)
    const sing =  await singXml(xml)
    
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
                        //console.log(sendR)
                        console.log('\n')
                        console.log(resTwo.RespuestaAutorizacionComprobante)
                        console.log('\n')
                      //  console.log(resTwo.RespuestaAutorizacionComprobante.autorizaciones.autorizacion.comprobante)
                        console.log('\n')
                        console.log(resTwo.RespuestaAutorizacionComprobante.autorizaciones.autorizacion.mensajes)
                    })  
                })
            }else{
                console.log(res, res.RespuestaRecepcionComprobante.comprobantes?.comprobante)
            }
    
        })

    })

    //await pdfBill(data)
    
    return sing
}


module.exports = {
    invoiceData
}