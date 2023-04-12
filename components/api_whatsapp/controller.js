const { createBot, createProvider, createFlow, addKeyword, EVENTS} = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const { waChatKey} = require('@adiwajshing/baileys/lib/Store/make-in-memory-store')
const mime = require('mime-types')
const path = require('path'); 
const fs = require('fs');
const nodemailer = require("nodemailer");

const apiW = async (url,email,number) =>{
  const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'arley4024@gmail.com', // generated ethereal user
        pass: 'keodcfxszvxahwbr', // generated ethereal password
      },
    });

    transporter.verify().then(()=>{
      console.log('se envio el mensaje ')
    })

    function isPdfFile(filename) {
        return path.extname(filename) === '.pdf';
    }
      
      
      const pdfFolder = path.join(__dirname, url);
      const files = await fs.promises.readdir(pdfFolder);
      const pdfFilename = files.find(isPdfFile);
      const filepath = path.join(pdfFolder, pdfFilename);
      const mimeType = mime.lookup(filepath)
      const fileName = pdfFilename.split('.')[0];
  
      const modProvider = await adapterProvider.getInstance();
      await modProvider.sendMessage(`${number}@c.us`, {
          document: { url: filepath },
          mimetype: mimeType,
          fileName: fileName,
      })

      
      await transporter.sendMail({
        from: '"ESTA ES TU FACTURA" <arley4024@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "FACTURA TRIONICA✔", // Subject line
        text: "Adjuntamos tu factura revisala y si algo nos comentas", // plain text body
        attachments: 
          [
            {   // filename and content type is derived from path
              filename: `${fileName}.pdf`,
              path: filepath // stream this file
            },
          ]
      });


    QRPortalWeb()

  
  // Tiene que eliminar el pdf despues de todo 
  fs.unlink(url, (err) => {
    if (err) throw err;
    console.log('El archivo fue eliminado exitosamente');
  });
 }
 await main()
}

