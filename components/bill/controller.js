/* Modules */
const { model }     = require('mongoose')
const fs            = require('fs')
const { pdfBill }   = require('../pdf/controller')



/* Logic */

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