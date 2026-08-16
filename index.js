const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

async function iniciarDanibot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("auth_info_baileys");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ Danibot conectado a WhatsApp");
    }

    if (connection === "close") {
      const volverAConectar =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (volverAConectar) {
        iniciarDanibot();
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const mensaje = messages[0];

    if (!mensaje.message || mensaje.key.fromMe) return;

    const texto =
      mensaje.message.conversation ||
      mensaje.message.extendedTextMessage?.text ||
      "";

    if (texto.toLowerCase() === ".menu") {
      await sock.sendMessage(mensaje.key.remoteJid, {
        text:
`╭━━━〔 🤖 DANIBOT 〕━━━╮
┃
┃ 👋 Hola, soy Danibot
┃
┃ 📋 COMANDOS
┃
┃ • .menu
┃ • .ping
┃ • .hola
┃
╰━━━━━━━━━━━━━━━━━━╯`
      });
    }

    if (texto.toLowerCase() === ".ping") {
      await sock.sendMessage(mensaje.key.remoteJid, {
        text: "🏓 Pong! Danibot está activo."
      });
    }

    if (texto.toLowerCase() === ".hola") {
      await sock.sendMessage(mensaje.key.remoteJid, {
        text: "👋 ¡Hola! Soy Danibot 🤖"
      });
    }
  });
}

iniciarDanibot();
