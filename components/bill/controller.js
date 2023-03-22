/* Modules */
const { model }     = require('mongoose')
const { pdfBill }   = require('../pdf/controller')
const fs            = require('fs')
const path          = require('path')
const forge         = require ( 'node-forge' ) ;
const moment        = require('moment'); 


/* Logic */

const singXml = (xml) =>{

    //Funcion de utilidad

    const sha1_base64 = value =>{
        const md = forge.md.sha1.create()
        md.update(value)
        return Buffer.from(md.digest().toHex(), 'hex').toString('base64')
    }

    const hexToBase64 = str => {
        let hex = ('00' + str).slice(0 - str.length - str.length % 2);
        
        return Buffer.from(String.fromCharCode.apply(null,
            hex.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")).toString('base64')
        );
    }
    
    const bigint2base64 = bigint => {
        let base64 = '';
        base64 = Buffer.from(bigint.toString(16).match(/\w{2}/g).map(function(a){return String.fromCharCode(parseInt(a, 16));} ).join("")).toString('base64')
        
        base64 = base64.match(/.{1,76}/g).join("\n");
        
        return base64;
    }

    const random = () => {
        return Math.floor(Math.random() * 999000) + 990;    
    }


    const PASSWORD = ''
    const SINGP12 = fs.readFileSync(path.join(__dirname,`../../ANDRES_PAUL_JARAMILLO_VACA_270622123005.p12`))
    const arrayUint8 = new Uint8Array(SINGP12)
    const p12B64     = forge.util.binary.base64.encode(arrayUint8)
    const p12Der     = forge.util.decode64(p12B64)
    const p12Asn1    = forge.asn1.fromDer(p12Der)

    const P12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1,PASSWORD)


    const certBags = P12.getBags({bagType:forge.pki.oids.certBag})
    const cert = certBags[forge.oids.certBag][0].cert;
    const pkcs8bags = P12.getBags({bagType:forge.pki.oids.pkcs8ShroudedKeyBag})
    const pkcs8 = pkcs8bags[forge.oids.pkcs8ShroudedKeyBag][0]
    const key = pkcs8.key

    if( key == null ) key = pkcs8.asn1
    
    const certificateX509_pem  = forge.pki.certificateToPem(cert)

    let certificateX509 = certificateX509_pem;

    certificateX509 = certificateX509.substring( certificateX509.indexOf('\n') )
    certificateX509 = certificateX509.substring( 0, certificateX509.indexOf('\n-----END CERTIFICATE-----') )

    certificateX509 = certificateX509.replace(/\r?\n|\r/g, '').replace(/([^\0]{76})/g, '$1\n')

    /*
        *Obtener hast
        *Pasar certificado a formato DER y sacar su hash:
    */
    let certificateX509_asn1 = forge.pki.certificateToAsn1(cert)
    let certificateX509_der = forge.asn1.toDer(certificateX509_asn1).getBytes()

    let certificateX509_der_hash = sha1_base64(certificateX509_der)

    //Serial Number
    const  X509SerialNumber = parseInt(cert.serialNumber, 16)

    let exponent = hexToBase64(key.e.data[0].toString(16))          
    let modulus  = bigint2base64(key.n)


    const sha1_comprobante = sha1_base64(xml.replace('<?xml version="1.0" encoding="UTF-8"?>\n', ''));

    const xmlns = 'xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#"';

    //numeros involucrados en los hash:
    
    //var Certificate_number = 1217155;//p_obtener_aleatorio(); //1562780 en el ejemplo del SRI
    const Certificate_number = random() //1562780 en el ejemplo del SRI
    
    //var Signature_number = 1021879;//p_obtener_aleatorio(); //620397 en el ejemplo del SRI
    const Signature_number = random() //620397 en el ejemplo del SRI
    
    //var SignedProperties_number = 1006287;//p_obtener_aleatorio(); //24123 en el ejemplo del SRI
    const SignedProperties_number = random() //24123 en el ejemplo del SRI

    //numeros fuera de los hash:
    
    //var SignedInfo_number = 696603;//p_obtener_aleatorio(); //814463 en el ejemplo del SRI
    const SignedInfo_number = random() //814463 en el ejemplo del SRI
    
    //var SignedPropertiesID_number = 77625;//p_obtener_aleatorio(); //157683 en el ejemplo del SRI
    const SignedPropertiesID_number = random() //157683 en el ejemplo del SRI
    
    //var Reference_ID_number = 235824;//p_obtener_aleatorio(); //363558 en el ejemplo del SRI
    const Reference_ID_number = random() //363558 en el ejemplo del SRI
    
    //var SignatureValue_number = 844709;//p_obtener_aleatorio(); //398963 en el ejemplo del SRI
    const SignatureValue_number = random() //398963 en el ejemplo del SRI
    
    //var Object_number = 621794;//p_obtener_aleatorio(); //231987 en el ejemplo del SRI
    const Object_number = random() //231987 en el ejemplo del SRI

    // Construcion del Sing del xml
    let SignedProperties = ''
    
    SignedProperties += '<etsi:SignedProperties Id="Signature' + Signature_number + '-SignedProperties' + SignedProperties_number + '">'  //SignedProperties
        SignedProperties += '<etsi:SignedSignatureProperties>'
            SignedProperties += '<etsi:SigningTime>'

                //SignedProperties += '2016-12-24T13:46:43-05:00';//moment().format('YYYY-MM-DD\THH:mm:ssZ');
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
    SignedProperties += '</etsi:SignedProperties>' //fin SignedProperties

    let SignedProperties_para_hash = SignedProperties.replace('<etsi:SignedProperties', '<etsi:SignedProperties ' + xmlns)

    const sha1_SignedProperties = sha1_base64(SignedProperties_para_hash)

    let  KeyInfo  = ''

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

                    //KeyInfo += 'AQAB';
                    KeyInfo += exponent;

                KeyInfo += '</ds:Exponent>'
            KeyInfo += '\n</ds:RSAKeyValue>'
        KeyInfo += '\n</ds:KeyValue>'
    KeyInfo += '\n</ds:KeyInfo>'

    let KeyInfo_para_hash = KeyInfo.replace('<ds:KeyInfo', '<ds:KeyInfo ' + xmlns)

    const sha1_certificado = sha1_base64(KeyInfo_para_hash)


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

    let signature = Buffer.from(key.sign(md)).toString('base64').match(/.{1,76}/g).join("\n")




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

    return  xml.replace(/(<[^<]+)$/, xades_bes + '$1');

}

const xlmBill = ({tax, details,product}) =>{
    //Informalcion Tributaria
    const {
        ambiente,
        tipoEmision,
        razonSocial, 
        nombreComercial,
        ruc,
        claveAcceso,
        codDoc,
        estab, 
        ptoEmi,
        secuencial,
        dirMatriz,
    } = tax
    
    //Detalle de la factura
    const {
        fechaEmision,
        dirEstablecimiento,
        contribuyenteEspecial, 
        obligadoContabilidad,
        tipoIdentificacionComprador,
        razonSocialComprador,
        identificacionComprador,
        totalSinImpuestos, 
        totalDescuento,
        propina,
        importeTotal,
        moneda
    } = details

    let xlm = `
        <?xml version="1.0" encoding="UTF-8"?>
        <factura id="${1005}" version="1.1.0">
            <infoTributaria>
                <ambiente>${ambiente}</ambiente>
                <tipoEmision>${tipoEmision}</tipoEmision>
                <razonSocial>${razonSocial}</razonSocial>
                <nombreComercial>${nombreComercial}</nombreComercial>
                <ruc>${ruc}</ruc>
                <claveAcceso>${claveAcceso}</claveAcceso>
                <codDoc>${codDoc}</codDoc>
                <estab>${estab}</estab>
                <ptoEmi>${ptoEmi}</ptoEmi>
                <secuencial>${secuencial}</secuencial>
                <dirMatriz>${dirMatriz}</dirMatriz>
            </infoTributaria>
            <infoFactura>
                <fechaEmision>${new Date().toString()}</fechaEmision>
                <dirEstablecimiento>${dirEstablecimiento}</dirEstablecimiento>
                <contribuyenteEspecial>${contribuyenteEspecial}</contribuyenteEspecial>
                <obligadoContabilidad>${obligadoContabilidad}</obligadoContabilidad>
                <tipoIdentificacionComprador>${tipoIdentificacionComprador}</tipoIdentificacionComprador>
                <razonSocialComprador>${razonSocialComprador}</razonSocialComprador>
                <identificacionComprador>${identificacionComprador}</identificacionComprador>
                <totalSinImpuestos>${totalSinImpuestos}</totalSinImpuestos>
                <totalDescuento>${totalDescuento}</totalDescuento>
                <totalConImpuestos>
                    <totalImpuesto>
                        <codigo>000</codigo>
                        <codigoPorcentaje>${moneda}</codigoPorcentaje>
                        <baseImponible>${importeTotal}</baseImponible>
                        <valor>${propina}</valor>
                    </totalImpuesto>
                </totalConImpuestos>
                <propina>${propina}</propina>
                <importeTotal>${importeTotal}</importeTotal>
                <moneda>${moneda}</moneda>
            </infoFactura>
            <detalles>
    `
    
    product.forEach((element,index) => {

        xlm += `
            <detalle>
                <codigoPrincipal>${element.nombre}</codigoPrincipal>
                <descripcion>${element.descripcion}</descripcion>
                <cantidad>${element.cantidad}</cantidad>
                <precioUnitario>${element.preciou}</precioUnitario>
                <descuento>${element.cantidad_descuento}</descuento>
                <precioTotalSinImpuesto>${element.codigos_impuestos}</precioTotalSinImpuesto>
                <impuestos>
                    <impuesto>
                        <codigo>${element.codigos_impuestos}</codigo>
                        <codigoPorcentaje>${element.cantidad_descuento}</codigoPorcentaje>
                        <tarifa>${element.preciou}</tarifa>
                        <baseImponible>${element.iva}</baseImponible>
                        <valor>${element.cantidad_descuento}</valor>
                    </impuesto>
                </impuestos>            
            </detalle>
        `
    })


    //Se genera 
    xlm += `
            </detalles>
            <infoAdicional>
                <campoAdicional nombre="Lugar Entrega">LUGAR DE ENTREGA DEL PRODUCTO O SERVICIO</campoAdicional>
                <campoAdicional nombre="Observaciones">OBSERVACIONES ADICIONALES</campoAdicional>
            </infoAdicional>
        </factura>
    `

    return singXml(xlm)
}

const invoiceData = (bill) =>{
    pdfBill(bill)
    return xlmBill(bill)    
}

module.exports = {
    invoiceData
}