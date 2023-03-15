const { model } = require('mongoose');
const { create } = require('xmlbuilder2');

const xlm2 = ({product, tax, details}) => {

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
    const root = create({ 
        version: '1.0' , 
        encoding: "UTF-8"
    })
    .ele('factura', { id: 'val', version:"1.1.0" })
    .ele('infoTributaria')
        .ele('ambiente').txt(ambiente).up()
        .ele('tipoEmision').txt(tipoEmision).up()
        .ele('razonSocial').txt(razonSocial).up()
        .ele('nombreComercial').txt(nombreComercial).up()
        .ele('ruc').txt(ruc).up()
        .ele('claveAcceso').txt(claveAcceso).up()
        .ele('codDoc').txt(codDoc).up()
        .ele('estab').txt(estab).up()
        .ele('ptoEmi').txt(ptoEmi).up()
        .ele('secuencial').txt(secuencial).up()
        .ele('dirMatriz').txt(dirMatriz).up()
    .up()
    .ele('  ')
        .ele('fechaEmision').txt(fechaEmision).up()
        .ele('dirEstablecimiento').txt(dirEstablecimiento).up()
        .ele('contribuyenteEspecial').txt(contribuyenteEspecial).up()
        .ele('obligadoContabilidad').txt(obligadoContabilidad).up()
        .ele('tipoIdentificacionComprador').txt(tipoIdentificacionComprador).up()
        .ele('razonSocialComprador').txt(razonSocialComprador).up()
        .ele('identificacionComprador').txt(identificacionComprador).up()
        .ele('totalSinImpuestos').txt(totalSinImpuestos).up()
        .ele('totalDescuento').txt(totalDescuento).up()
        .ele('totalConImpuestos')
        .ele('totalImpuesto')
        .ele('codigo').txt('2').up()
        .ele('codigoPorcentaje').txt('2').up()
        .ele('baseImponible').txt('2').up()
        .ele('valor').txt('2').up()
            .up()
        .up()
        .ele('totalConImpuestos')
            .ele('propina').txt('2').up()
            .ele('importeTotal').txt('2').up()
            .ele('DÓLAR').txt('2').up() 
        .up()
    .up()
    .ele('detalles')
        .ele('detalle')
            .ele('codigoPrincipal').txt('2').up()
            .ele('descripcion').txt('2').up()
            .ele('cantidad').txt('2').up()
            .ele('precioUnitario').txt('2').up()
            .ele('descuento').txt('2').up()
            .ele('precioTotalSinImpuesto').txt('2').up()
            .ele('impuestos')
                .ele('impuesto')
                    .ele('codigo').txt('2').up()
                    .ele('codigoPorcentaje').txt('2').up()
                    .ele('tarifa').txt('2').up()
                    .ele('baseImponible').txt('2').up()
                    .ele('valor').txt('2').up()
                .up()
            .up()
        .up()
    .up()
    .ele('infoAdicional')
        .ele('campoAdicional').txt('2').up()
        .ele('campoAdicional').txt('2').up()
    .up()
.up();

    const x = root.end({ prettyPrint: true });
    console.log(x);
    return x
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
    console.log(xlm)
    return xlm
}

const invoiceData = (bill) =>{

    return xlmBill(bill)    
}



module.exports = {
    invoiceData
}