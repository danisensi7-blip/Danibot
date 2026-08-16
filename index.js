const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
async function iniciarDanibot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("auth_info_baileys");

  const sock = makeWASocket({
    auth: state, 
  });


  sock.ev.on("creds.update", saveCreds);

 sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {

    if (connection === "connecting" && !state.creds.registered) {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const phoneNumber = "573132795505";
    const code = await sock.requestPairingCode(phoneNumber);

    console.log("📱 CÓDIGO DE VINCULACIÓN:", code);
  } catch (error) {
    console.error("❌ Error obteniendo código de vinculación:", error);
  }
    }
       
   
   

   if (connection === "close") {
    console.log("❌ Conexión cerrada.");
   }
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
