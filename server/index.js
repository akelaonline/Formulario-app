const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // URL de tu aplicación React
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('startCampaign', async (data) => {
        const { urls, template } = data;
        
        try {
            // Iniciar el navegador
            const browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args: ['--start-maximized']
            });

            // Procesar cada URL
            for (let i = 0; i < urls.length; i++) {
                // Verificar si el cliente sigue conectado
                if (!socket.connected) {
                    await browser.close();
                    return;
                }

                try {
                    const page = await browser.newPage();
                    
                    // Emitir progreso
                    socket.emit('progress', {
                        currentUrl: urls[i],
                        index: i,
                        total: urls.length
                    });

                    // Navegar a la URL
                    await page.goto(urls[i]);

                    // Rellenar cada campo del formulario
                    for (const field of template.fields) {
                        try {
                            // Esperar a que el campo esté disponible
                            const input = await page.waitForSelector(
                                `input[name="${field.name}"], textarea[name="${field.name}"]`,
                                { timeout: 5000 }
                            );

                            // Limpiar el campo
                            await input.click({ clickCount: 3 });
                            await input.press('Backspace');

                            // Escribir el valor simulando comportamiento humano
                            await input.type(field.value, { delay: 100 });

                            // Pausa aleatoria
                            await page.waitForTimeout(Math.random() * 1000 + 500);
                        } catch (error) {
                            console.error(`Error en campo ${field.name}:`, error);
                            socket.emit('error', { message: `Error en campo ${field.name}: ${error.message}` });
                        }
                    }

                    // Buscar y hacer clic en el botón de envío
                    const submitButton = await page.waitForSelector('button[type="submit"], input[type="submit"]');
                    await submitButton.click();

                    // Esperar a que se complete el envío
                    await page.waitForTimeout(2000);

                    // Cerrar la página actual
                    await page.close();

                    // Emitir éxito para esta URL
                    socket.emit('urlCompleted', {
                        url: urls[i],
                        index: i
                    });

                } catch (error) {
                    console.error(`Error procesando URL ${urls[i]}:`, error);
                    socket.emit('error', { 
                        url: urls[i],
                        message: error.message 
                    });
                }
            }

            // Cerrar el navegador al terminar
            await browser.close();
            socket.emit('campaignCompleted');

        } catch (error) {
            console.error('Error en la campaña:', error);
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('stopCampaign', () => {
        // Implementar lógica para detener la campaña
        socket.emit('campaignStopped');
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const port = 3001;
server.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
