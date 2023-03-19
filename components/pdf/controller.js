//Modules 
const fs      = require('fs')
const path    = require('path')
const pdf     = require('puppeteer')
const hbs     = require('handlebars')




/* Configuracion */
const options = {
    formate: 'A4',
        orientation: 'portrait',
        border: '2mm',
        childProcessOptions: {
            env: {
              OPENSSL_CONF: '/dev/null',
            },
          }
}


const viewBill = async (data) =>{
    //const filePath = path.join(process.cwd(),'templates','bill.hbs')
    console.log(data)
    const html = fs.readFileSync(path.join(__dirname,'../../templates/bill.hbs'),'utf-8')
const info = {
    products: data
}
    return hbs.compile(html)(info)
}

const pdfBill = async ({ product }) => {
   // const html = fs.readFileSync(path.join(__dirname,'../../view/templatesd/templete.html'),'utf-8')
   const html = ''
    const pdfName = Math.random() + '_doc.pdf'
    const table = []

    const totalValue = (obj, key = 'total') => {
        let total = 0
        obj.forEach(f => total += parseFloat(f[`${key}`].toString()))
        return total.toFixed(2)
    }
    
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

    //iva 
    const subtotal = totalValue(table)
    const tax = (subtotal * 12) / 100
    const totalTax = (parseFloat(subtotal) + parseFloat(tax))


    /* html dinamico */
    const obj = {
        prodlist : table,
        subtotal,
        iva      : tax.toFixed(2),
        total    : totalTax.toFixed(2)
    }



    const document = {
        html,
        data:{
            products:obj
        },
        path:`./docs/${pdfName}`
    }



    const browser = await pdf.launch()
    const newPdf  = await browser.newPage()


    const content = await viewBill(table)


    await newPdf.setContent(content)
    await newPdf.emulateMediaType('screen')
    await newPdf.pdf({
        path:document.path,
        format:'A4',
        printBackground:true
    })
    
    console.log('done')
    await browser.close()

}




module.exports = {
    pdfBill
}   