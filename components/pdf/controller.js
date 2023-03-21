//Modules 
const fs      = require('fs')
const path    = require('path')
const pdf     = require('puppeteer')
const hbs     = require('handlebars')


const pdfBill = async ({ product }) => {
    //Name del pdf
    const pdfName = Math.random() + '_doc.pdf'
    
    //productos 
    const table = []

    //Calcula el valor total de cualquier propiedad numerica
    const totalValue = (obj, key = 'total') => {
        let total = 0
        obj.forEach(f => total += parseFloat(f[`${key}`].toString()))
        return total.toFixed(2)
    }
    
    //Se crea el objeto de los productos dinamicos
    product.forEach(d =>{
        const total = ( parseInt(d.quantity) * parseFloat(d.unit_Price) ) - parseFloat(d.discount == '' ? '0': d.discount) 
        table.push({       
            code                : d.code,
            quantity            : d.quantity,
            description         : d.description,
            additional_details  : d.additional_details,
            unit_Price          : d.unit_Price,
            discount            : d.discount == '' ? '0.00' : d.discount,
            total               : total.toFixed(2)
        })  
    })


    //Calculos necesarios para la factura 
    const subtotal = totalValue(table)
    const tax = (subtotal * 12) / 100
    const totalTax = (parseFloat(subtotal) + parseFloat(tax))



    //Informacion para generacion del pdf
    const pdf = {
        product:table,
        pdfName:pdfName,
        path:`./docs/${pdfName}`,
        template:'bill'
    }

    await generateInvoiceHtml(pdf)


}

const htmlView = (template,data) =>{
    const html = fs.readFileSync(path.join(__dirname,`../../templates/${template}.hbs`),'utf-8')
    const info = {  products: data }
    return hbs.compile(html)(info)
}

const generateInvoiceHtml = async ({pdfName, product,template,path}) =>{
    console.log(`generating pdf: ${pdfName} ...`)
    const browser = await pdf.launch()
    const page  = await browser.newPage()

    //PDF HTML VIEW 
    await page.setContent(htmlView(template,product))

    //CONFIG
    await page.emulateMediaType('screen')
    await page.pdf({
        path:path,
        format:'A4',
        printBackground:true
    })


    console.log('done')
    await browser.close()
}

module.exports = {
    pdfBill
}   