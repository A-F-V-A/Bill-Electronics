/* Modulos */
const soap = require('soap')

/* Componets */
const { URL }                  = require('./routes')
const { createXMl, singXml }   = require('../xml/controller')
const { pdfBill }              = require('../pdf/controller')

const invoiceData = async data =>{
    const [xml, key, serial]  =  createXMl(data)
    const sing =  await singXml(xml)
    
    const send = { xml: Buffer.from(sing).toString('base64') }

    await soap.createClient(URL.VALIDATE, async (err,client) =>{
        if(err)
            console.error(err)
        else{
            await client.validarComprobante(send, async (err,res) =>{
                console.log(' *-*-*-* Validar comprobante *-*-*-*')
                let { estado, comprobantes } = res.RespuestaRecepcionComprobante
                if(estado == 'RECIBIDA'){
                    console.log(`\nestado: ${estado}`)
                    //Clave de acceso
                    const sendR = { claveAccesoComprobante:key.toString() }
                    //Autorizar Comprobante
                    await soap.createClient(URL.AUTHORIZE, async (errTwo,clientTwo)=>{
                        if(errTwo)
                            console.error(errTwo)
                        else{
                            await clientTwo.autorizacionComprobante(sendR, (twoErr,resTwo) =>{
                                console.log('\n*-*-*-* Autorizar comprobante *-*-*-*')
                                if(twoErr)
                                    console.error(twoErr)
                                else{
                                    const {estado:st,fechaAutorizacion, ambiente} = resTwo.RespuestaAutorizacionComprobante.autorizaciones.autorizacion
                                    console.log(`\nEstado: ${st} \nFecha de Autorizacion: ${fechaAutorizacion} \nAmbiente: ${ambiente}`)
                                    const inf = {
                                        fechaAutorizacion,
                                        ambiente,
                                        serial
                                    }
                                    pdfBill(data,key,inf)
                                }
                            })
                        }
                    })
                }else{
                    console.log(`\nestado: ${estado}\n`)
                    console.log(res.RespuestaRecepcionComprobante.comprobantes.comprobante.mensajes)
                }
            })
        }
    })

    return sing
}

module.exports = {
    invoiceData
}