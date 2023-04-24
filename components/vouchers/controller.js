/* lib */
const fs     = require('fs')
const path   = require('path')

/* modulos */
const sing                  = require('../sing/sing')
const invoice               = require('./model/invoice')
const withholdings          = require('./model/withholdings')
const guides                = require('./model/guides')
const { generarSecuencial } = require('./util/util')
const { 
    VALIDATE,
    AUTHORIZE
}                           = require('../webServices/controller')
const { 
    pdfBill,
    pdfWithholdings,
    pdfGuides 
}                           = require('../pdf/controller')

/* Logic */

const resposeInvoice = async data =>{

    /*Consulta a database */
    const password = '13061994'
    const p12      = fs.readFileSync(path.join(__dirname, `../../ANDRES_PAUL_JARAMILLO_VACA_270622123005.p12`))
    const SEC      = generarSecuencial('000000079')

    /* logic */
    const [xml, key] = invoice(data,SEC)
    const singXml = await sing(xml,password,p12)

    try{
        const validate = await VALIDATE(singXml)
        let { estado } = validate.RespuestaRecepcionComprobante
        if( estado == 'DEVUELTA'){
            const { mensaje } = validate.RespuestaRecepcionComprobante.comprobantes.comprobante.mensajes
            console.log(mensaje)
        }else{
            const authorize =  await AUTHORIZE(key)
            const {
                estado: status,
                fechaAutorizacion,
                ambiente
            } = authorize.RespuestaAutorizacionComprobante.autorizaciones.autorizacion

            if(status == 'AUTORIZADO'){
                /*  Generar pdf */
                const send = {
                    fechaAutorizacion,
                    ambiente,
                    serial:SEC
                }

                await pdfBill(data,key,send)
                return singXml
                  /* exito: guardar en la base de datos en nuevo secuencial se recomienda guardar tambien el key comprobante */
            }else
                console.log(authorize.RespuestaAutorizacionComprobante)
   
        }
        return null
    }catch(err){
        console.error(err)
        return null
    }
}

const resposeWithholdings = async data =>{
        /*Consulta a database */
        const password = '13061994'
        const p12      = fs.readFileSync(path.join(__dirname, `../../ANDRES_PAUL_JARAMILLO_VACA_270622123005.p12`))
        const SEC      = generarSecuencial('000000007')
    
        /* logic */
        const [xml, key] = withholdings(data,SEC)

        const singXml = await sing(xml,password,p12,07)

        try{
            const validate = await VALIDATE(singXml)
            let { estado } = validate.RespuestaRecepcionComprobante
            if( estado == 'DEVUELTA'){
                const { mensaje } = validate.RespuestaRecepcionComprobante.comprobantes.comprobante.mensajes
                console.log(mensaje)
            }else{
                const authorize =  await AUTHORIZE(key)
                const {
                    estado: status,
                    fechaAutorizacion,
                    ambiente
                } = authorize.RespuestaAutorizacionComprobante.autorizaciones.autorizacion
    
                if(status == 'AUTORIZADO'){
                    /*  Generar pdf */
                    const send = {
                        fechaAutorizacion,
                        ambiente,
                        serial:SEC
                    }
    
                    await pdfWithholdings(data,key,send)
                    return singXml
                      /* exito: guardar en la base de datos en nuevo secuencial se recomienda guardar tambien el key comprobante */
                }else
                    console.log(authorize.RespuestaAutorizacionComprobante.autorizaciones.autorizacion.mensajes)
       
            }
            return null
        }catch(err){
            console.error(err)
            return null
        }
}

const resposeGuides = async data =>{
        /*Consulta a database */
        const password = '13061994'
        const p12      = fs.readFileSync(path.join(__dirname, `../../ANDRES_PAUL_JARAMILLO_VACA_270622123005.p12`))
        const SEC      = generarSecuencial('000000011')
    
        /* logic */
        const [xml, key] = guides(data,SEC)
        const singXml = await sing(xml,password,p12,06)


        try{
            const validate = await VALIDATE(singXml)
            let { estado } = validate.RespuestaRecepcionComprobante
            if( estado == 'DEVUELTA'){
                const { mensaje } = validate.RespuestaRecepcionComprobante.comprobantes.comprobante.mensajes
                console.log(mensaje)
            }else{
                const authorize =  await AUTHORIZE(key)
                const {
                    estado: status,
                    fechaAutorizacion,
                    ambiente
                } = authorize.RespuestaAutorizacionComprobante.autorizaciones.autorizacion
    
                if(status == 'AUTORIZADO'){
                    /*  Generar pdf */
                    const send = {
                        fechaAutorizacion,
                        ambiente,
                        serial:SEC
                    }
    
                    await pdfGuides(data,key,send)
                    return singXml
                      /* exito: guardar en la base de datos en nuevo secuencial se recomienda guardar tambien el key comprobante */
                }else
                    console.log(authorize.RespuestaAutorizacionComprobante.autorizaciones.autorizacion.mensajes)
            }
            return null
        }catch(err){
            console.error(err)
            return null
        }
}

module.exports = {
    resposeInvoice,
    resposeWithholdings,
    resposeGuides
}


