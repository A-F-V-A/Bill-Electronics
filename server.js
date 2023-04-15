if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const bodyParser = require('body-parser');
const router = require('./network/routes');
const layouts = require('express-ejs-layouts');
//modulos api
const { createBot, createProvider } = require('@bot-whatsapp/bot')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const QRPortalWeb = require('@bot-whatsapp/portal')
const fs = require('fs');

//modulos de login
const cors =require("cors");
const morgan =require( "morgan");
const helmet =require( "helmet");

const main = async () => {
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        provider: adapterProvider,
    })

    const app = express()
    app.use(layouts)
    app.use(bodyParser.json())
    app.use('/app',express.static('public'))
    router(app)

    app.set("json spaces", 4);

    // Middlewares
    app.use(
    cors({
        // origin: "http://localhost:3000",
    })
    );
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.post('/send-pdf-whatsapp', async (req, res) => {
        const { number, filepath, mimeType, filename } = req.body;
        const Instancia_provider = await adapterProvider.getInstance();
        await Instancia_provider.sendMessage(`${number}@c.us`, {
            document: { url: filepath },
            mimetype: mimeType,
            fileName: filename
        })
        res.send('Mensaje Enviado!')

        await fs.unlink(filepath, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(`El archivo ${filepath} fue eliminado exitosamente`);
        });
    })

    const PORT = 4000
    app.listen(PORT, () => console.log(`http://localhost:${PORT}`))   

    QRPortalWeb()
}

main()
