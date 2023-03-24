/*
https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?wsdl
*/

const URL_VALIDATE = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl'
const URL_ACTORIZE = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'


module.exports = {
    URL:{
        VALIDATE: URL_VALIDATE,
        ACTORIZE: URL_ACTORIZE
    }
}