/* Modules */
const fs        = require('fs')
const forge     = require('node-forge')
const path      = require('path')
const moment    = require('moment')
const crypto    = require('crypto')



/* Component */
const { 
	SignatureValue,
	CERTICATE_DIGITAL
}                 = require('./signature')



const AMBIENTE = 1

function generarCodigo() {
    let codigo = '';
    for (let i = 0; i < 8; i++) {
        codigo += Math.floor(Math.random() * 10);
    }
    return codigo;
}

function generarSecuencial(id) {
    // Obtener el número del secuencial a partir de la cadena de entrada
    const numero = parseInt(id.slice(-9)) + 1

    // Convertir el número a una cadena de texto y agregar ceros a la izquierda si es necesario
    const numeroConCeros = numero.toString().padStart(9, '0')

    // Crear el secuencial concatenando la parte inicial de la cadena de entrada con el número del secuencial
    const secuencial = id.slice(0, -9) + numeroConCeros

    return secuencial
}

function calcularDigitoVerificador(claveAcceso) {
    let suma = 0;
    let factor = 2;

    for (let i = claveAcceso.length - 1; i >= 0; i--) {
        suma += claveAcceso[i] * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }

    const mod = suma % 11
    const final = 11 - mod
    const dv = final === 11 ? 0 : final === 10 ? 1 : final

    return dv.toString();
}

function generarSerie() {
    const longitud = 6;
    let numero = '';
    for (let i = 0; i < longitud; i++) {
        numero += Math.floor(Math.random() * 10); // Generar un dígito aleatorio del 0 al 9
    }
    return numero;
}

function accessKey(data, dete) {

    const { comprobante, ruc } = data.details

    let key = dete.toString().replace(/\//g, '')
    //Tipo de comprobante
    key +=
        comprobante.toString() + ruc.toString() +
        AMBIENTE.toString() + generarSerie() +
        generarSecuencial('000000000') + generarCodigo() + '1'

    return key + calcularDigitoVerificador(key.toString())
}

const createXMl = data => {
    const dete = moment().format('DD/MM/YYYY') //fecha de emision
    const secuencial = generarSecuencial('000000000') //Genera el secuencial alatorio
    const key = accessKey(data, dete)


    //Dinamico precios
    const totalValue = (obj, key = 'total') => {
        let total = 0
        obj.forEach(f => total += parseFloat(f[`${key}`].toString()))
        return total.toFixed(2)
    }

    const table = []

    //Se crea el objeto de los productos dinamicos
    data.product.forEach(d => {
        const total = (parseInt(d.quantity) * parseFloat(d.unit_Price)) - parseFloat(d.discount == '' ? '0' : d.discount)
        table.push({
            code: d.code,
            quantity: d.quantity,
            description: d.description,
            additional_details: d.additional_details,
            unit_Price: d.unit_Price,
            discount: d.discount == '' ? '0.00' : d.discount,
            total: total.toFixed(2),
            iva: d.iva,
            codigos_impuestos: d.codigos_impuestos,
            tarifa: d.tarifa
        })
    })

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <factura id="comprobante" version="1.0.0">
            <infoTributaria>
                <ambiente>${AMBIENTE}</ambiente>
                <tipoEmision>1</tipoEmision>
                <razonSocial>${data.details.razonSocial}</razonSocial>
                <nombreComercial>${data.details.nombreComercial}</nombreComercial>
                <ruc>${data.details.ruc}</ruc>
                <claveAcceso>${key}</claveAcceso>
                <codDoc>01</codDoc>
                <estab>001</estab>
                <ptoEmi>001</ptoEmi>
                <secuencial>${secuencial}</secuencial>
                <dirMatriz>${data.details.direccion}</dirMatriz>
            </infoTributaria>
            <infoFactura>
                <fechaEmision>${dete.toString()}</fechaEmision>
                <dirEstablecimiento>${data.details.direccion}</dirEstablecimiento>
                <contribuyenteEspecial>0000</contribuyenteEspecial>
                <obligadoContabilidad>SI</obligadoContabilidad>
                <tipoIdentificacionComprador>${data.customer.tipoDocumento}</tipoIdentificacionComprador>
                <razonSocialComprador>${data.customer.razonSocial}</razonSocialComprador>
                <identificacionComprador>${data.customer.id}</identificacionComprador>
                <totalSinImpuestos>${parseFloat(totalValue(table))}</totalSinImpuestos>
                <totalDescuento>${parseFloat(totalValue(table, 'discount'))}</totalDescuento>
                <totalConImpuestos>
                    <totalImpuesto>
                        <codigo>${data.tax.codigoTax}</codigo>
                        <codigoPorcentaje>${data.tax.tarifa}</codigoPorcentaje>
                        <baseImponible>${data.tax.imponible}</baseImponible>
                        <valor>${data.tax.valor}</valor>
                    </totalImpuesto>
                </totalConImpuestos>
                <propina>${data.tax.propina}</propina>   
                <importeTotal>${data.tax.imponible}</importeTotal>
                <moneda>${data.tax.moneda}</moneda>
            </infoFactura>
            <detalles>`

    table.forEach((element, index) => {

        xml += `<detalle>
                <codigoPrincipal>${element.code}</codigoPrincipal>
                <descripcion>${element.description}</descripcion>
                <cantidad>${element.quantity}</cantidad>
                <precioUnitario>${parseFloat(element.unit_Price)}</precioUnitario>
                <descuento>${parseFloat(element.discount)}</descuento>
                <precioTotalSinImpuesto>${element.total}</precioTotalSinImpuesto>
                <impuestos>
                    <impuesto>
                        <codigo>${element.iva}</codigo>   
                        <codigoPorcentaje>${element.codigos_impuestos}</codigoPorcentaje>
                        <tarifa>${element.tarifa}</tarifa>
                        <baseImponible>0.00</baseImponible>
                        <valor>0.00</valor>
                    </impuesto>
                </impuestos>            
            </detalle>`
    })

    //Final
    xml += `</detalles>
            <infoAdicional>
                <campoAdicional nombre="Lugar Entrega">LUGAR DE ENTREGA DEL PRODUCTO O SERVICIO</campoAdicional>
                <campoAdicional nombre="Observaciones">OBSERVACIONES ADICIONALES</campoAdicional>
            </infoAdicional>
        </factura>`

    return [xml, key]
}

const singXml = async xml =>{
    const sha1_base64 = value => {
        const sha1 = crypto.createHash('sha1');
        sha1.update(value);
        const hash = sha1.digest('base64');
        return hash;
    }
    
    const bigint2base64 = bigint => {
        const hexString = bigint.toString(16); // convierte el bigint a una cadena de caracteres hexadecimal
        const hexPairs = hexString.match(/\w{2}/g); // divide la cadena hexadecimal en pares de caracteres
        const utfChars = hexPairs.map(pair => String.fromCharCode(parseInt(pair, 16))); // convierte cada par hexadecimal en su correspondiente carácter UTF-8
        const utfString = utfChars.join(""); // une los caracteres UTF-8 en una sola cadena
        const base64 = Buffer.from(utfString, 'binary').toString('base64'); // convierte la cadena UTF-8 en base64
    
        const lines = base64.match(/.{1,76}/g); // divide la cadena base64 en líneas de 76 caracteres o menos
        const result = lines.join("\n"); // une las líneas con un salto de línea entre ellas
    
        return result;
    }
    
    const random = () => {
        return Math.floor(Math.random() * 999000) + 990;
    }
    
    const password = ''
    const p12      = fs.readFileSync(path.join(__dirname, `../../ANDRES_PAUL_JARAMILLO_VACA_270622123005.p12`))
    const SING     = await CERTICATE_DIGITAL(password,p12)

    /* X509 CERTIFICADO */
    let certificateX509 = SING.CERT_PEM
    certificateX509     = certificateX509.substring(certificateX509.indexOf('\n'))
    certificateX509     = certificateX509.substring(0, certificateX509.indexOf('\n-----END CERTIFICATE-----'))
    certificateX509     = certificateX509.replace(/\r?\n|\r/g, '').replace(/([^\0]{76})/g, '$1\n')

    /* X509 HASH */
    const certificateX509_der_hash = SING.X509HASH

    /* X509 Serial Number */
    const X509SerialNumber = parseInt(SING.CERT.serialNumber, 16)

    /* KEY MODULES  */
    const modulus = bigint2base64(SING.KEY.n)

    /* XML */
    const sha1_comprobante = sha1_base64(xml.replace('<?xml version="1.0" encoding="UTF-8"?>\n', ''))
    const xmlns            = 'xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#"'


    /* numeros involucrados en los hash: */

    const Certificate_number       = random() //1562780 en el ejemplo del SRI
    const Signature_number         = random() //620397 en el ejemplo del SRI
    const SignedProperties_number  = random() //24123 en el ejemplo del SRI

    /* numeros fuera de los hash: */

    const SignedInfo_number         = random() //814463 en el ejemplo del SRI
    const SignedPropertiesID_number = random() //157683 en el ejemplo del SRI
    const Reference_ID_number       = random() //363558 en el ejemplo del SRI
    const SignatureValue_number     = random() //398963 en el ejemplo del SRI
    const Object_number             = random() //231987 en el ejemplo del SRI

    /* XLM SignedProperties */

    let SignedProperties = ''

    SignedProperties += '<etsi:SignedProperties Id="Signature' + Signature_number + '-SignedProperties' + SignedProperties_number + '">'  //SignedProperties
    SignedProperties += '<etsi:SignedSignatureProperties>'
    SignedProperties += '<etsi:SigningTime>'

    SignedProperties += moment().format('YYYY-MM-DD\THH:mm:ssZ')

    SignedProperties += '</etsi:SigningTime>'
    SignedProperties += '<etsi:SigningCertificate>'
    SignedProperties += '<etsi:Cert>'
    SignedProperties += '<etsi:CertDigest>'
    SignedProperties += '<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">'
    SignedProperties += '</ds:DigestMethod>'
    SignedProperties += '<ds:DigestValue>'

    SignedProperties += certificateX509_der_hash

    SignedProperties += '</ds:DigestValue>'
    SignedProperties += '</etsi:CertDigest>'
    SignedProperties += '<etsi:IssuerSerial>'
    SignedProperties += '<ds:X509IssuerName>'
    SignedProperties += 'CN=AC BANCO CENTRAL DEL ECUADOR,L=QUITO,OU=ENTIDAD DE CERTIFICACION DE INFORMACION-ECIBCE,O=BANCO CENTRAL DEL ECUADOR,C=EC'
    SignedProperties += '</ds:X509IssuerName>'
    SignedProperties += '<ds:X509SerialNumber>'

    SignedProperties += X509SerialNumber;

    SignedProperties += '</ds:X509SerialNumber>'
    SignedProperties += '</etsi:IssuerSerial>'
    SignedProperties += '</etsi:Cert>'
    SignedProperties += '</etsi:SigningCertificate>'
    SignedProperties += '</etsi:SignedSignatureProperties>'
    SignedProperties += '<etsi:SignedDataObjectProperties>'
    SignedProperties += '<etsi:DataObjectFormat ObjectReference="#Reference-ID-' + Reference_ID_number + '">'
    SignedProperties += '<etsi:Description>'

    SignedProperties += 'contenido comprobante'

    SignedProperties += '</etsi:Description>'
    SignedProperties += '<etsi:MimeType>'
    SignedProperties += 'text/xml'
    SignedProperties += '</etsi:MimeType>'
    SignedProperties += '</etsi:DataObjectFormat>'
    SignedProperties += '</etsi:SignedDataObjectProperties>'
    SignedProperties += '</etsi:SignedProperties>'

   // let SignedProperties_para_hash = SignedProperties.replace('<etsi:SignedProperties', '<etsi:SignedProperties ' + xmlns)

    const sha1_SignedProperties = sha1_base64(SignedProperties)

    let KeyInfo = ''

    KeyInfo += '<ds:KeyInfo Id="Certificate' + Certificate_number + '">'
    KeyInfo += '\n<ds:X509Data>'
    KeyInfo += '\n<ds:X509Certificate>\n'

    //CERTIFICADO X509 CODIFICADO EN Base64 
    KeyInfo += certificateX509

    KeyInfo += '\n</ds:X509Certificate>'
    KeyInfo += '\n</ds:X509Data>'
    KeyInfo += '\n<ds:KeyValue>'
    KeyInfo += '\n<ds:RSAKeyValue>'
    KeyInfo += '\n<ds:Modulus>\n'

    //MODULO DEL CERTIFICADO X509
    KeyInfo += modulus;

    KeyInfo += '\n</ds:Modulus>'
    KeyInfo += '\n<ds:Exponent>'

    KeyInfo += 'AQAB'

    KeyInfo += '</ds:Exponent>'
    KeyInfo += '\n</ds:RSAKeyValue>'
    KeyInfo += '\n</ds:KeyValue>'
    KeyInfo += '\n</ds:KeyInfo>'

   // let KeyInfo_para_hash = KeyInfo.replace('<ds:KeyInfo', '<ds:KeyInfo ' + xmlns)

    const sha1_certificado = sha1_base64(KeyInfo)


    let SignedInfo = ''


    SignedInfo += '<ds:SignedInfo Id="Signature-SignedInfo' + SignedInfo_number + '">'
    SignedInfo += '\n<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315">'
    SignedInfo += '</ds:CanonicalizationMethod>'
    SignedInfo += '\n<ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1">'
    SignedInfo += '</ds:SignatureMethod>'
    SignedInfo += '\n<ds:Reference Id="SignedPropertiesID' + SignedPropertiesID_number + '" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature' + Signature_number + '-SignedProperties' + SignedProperties_number + '">'
    SignedInfo += '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
    SignedInfo += '</ds:DigestMethod>'
    SignedInfo += '\n<ds:DigestValue>'

    //HASH O DIGEST DEL ELEMENTO <etsi:SignedProperties>';
    SignedInfo += sha1_SignedProperties

    SignedInfo += '</ds:DigestValue>'
    SignedInfo += '\n</ds:Reference>'
    SignedInfo += '\n<ds:Reference URI="#Certificate' + Certificate_number + '">'
    SignedInfo += '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">'
    SignedInfo += '</ds:DigestMethod>'
    SignedInfo += '\n<ds:DigestValue>'

    //HASH O DIGEST DEL CERTIFICADO X509
    SignedInfo += sha1_certificado

    SignedInfo += '</ds:DigestValue>'
    SignedInfo += '\n</ds:Reference>'
    SignedInfo += '\n<ds:Reference Id="Reference-ID-' + Reference_ID_number + '" URI="#comprobante">'
    SignedInfo += '\n<ds:Transforms>'
    SignedInfo += '\n<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature">'
    SignedInfo += '</ds:Transform>'
    SignedInfo += '\n</ds:Transforms>'
    SignedInfo += '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">'
    SignedInfo += '</ds:DigestMethod>'
    SignedInfo += '\n<ds:DigestValue>'

    //HASH O DIGEST DE TODO EL ARCHIVO XML IDENTIFICADO POR EL id="comprobante" 
    SignedInfo += sha1_comprobante

    SignedInfo += '</ds:DigestValue>'
    SignedInfo += '\n</ds:Reference>'
    SignedInfo += '\n</ds:SignedInfo>'

    let SignedInfo_para_firma = SignedInfo.replace('<ds:SignedInfo', '<ds:SignedInfo ' + xmlns)

    const md = forge.md.sha1.create()
    md.update(SignedInfo_para_firma, 'utf8')


    //console.log(SignedInfo_para_firma)

    let signature = await SignatureValue(SING.PRIVATE_KEY_PEM,SING.PUBLIC_KEY_PEM,SignedInfo_para_firma)

    let xades_bes = ''

    //INICIO DE LA FIRMA DIGITAL 
    xades_bes += '<ds:Signature ' + xmlns + ' Id="Signature' + Signature_number + '">';
    xades_bes += '\n' + SignedInfo;

    xades_bes += '\n<ds:SignatureValue Id="SignatureValue' + SignatureValue_number + '">\n';

    //VALOR DE LA FIRMA (ENCRIPTADO CON LA LLAVE PRIVADA DEL CERTIFICADO DIGITAL) 
    xades_bes += signature;


    xades_bes += '\n</ds:SignatureValue>';

    xades_bes += '\n' + KeyInfo;

    xades_bes += '\n<ds:Object Id="Signature' + Signature_number + '-Object' + Object_number + '">';
    xades_bes += '<etsi:QualifyingProperties Target="#Signature' + Signature_number + '">';

    //ELEMENTO <etsi:SignedProperties>';
    xades_bes += SignedProperties;

    xades_bes += '</etsi:QualifyingProperties>';
    xades_bes += '</ds:Object>';
    xades_bes += '</ds:Signature>';

    //FIN DE LA FIRMA DIGITAL 

    return xml.replace(/(<[^<]+)$/, xades_bes + '$1');

}

module.exports = {
    createXMl,
    singXml
}
