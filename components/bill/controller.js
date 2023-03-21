/* Modules */
const { model }     = require('mongoose')
const { pdfBill }   = require('../pdf/controller')
const fs            = require('fs')
const path          = require('path')
const forge         = require ( 'node-forge' ) ;



/* Logic */


const singXml = () =>{

    //Funcion de utilidad

    const sha1_base64 = value =>{
        const md = forge.md.sha1.create()
        md.update(value)
        return Buffer.from(md.digest().toHex(), 'hex').toString('base64')
    }

    const hexToBase64 = str => {
        let hex = ('00' + str).slice(0 - str.length - str.length % 2);
        
        return btoa(String.fromCharCode.apply(null,
            hex.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
        );
    }
    
    const bigint2base64 = bigint => {
        let base64 = '';
        base64 = btoa(bigint.toString(16).match(/\w{2}/g).map(function(a){return String.fromCharCode(parseInt(a, 16));} ).join(""));
        
        base64 = base64.match(/.{1,76}/g).join("\n");
        
        return base64;
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

    console.log(X509SerialNumber,exponent,modulus,certificateX509_der_hash)
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
    singXml()
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
            <detalle_${index}>
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
            </detalle_${index}>
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

    return xlm
}

const invoiceData = (bill) =>{
    pdfBill(bill)
    return xlmBill(bill)    
}

module.exports = {
    invoiceData
}