const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const readline = require("readline");

async function iniciarDanibot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("auth_info_baileys");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  // CÓDIGO DE VINCULACIÓN
  if (!sock.authState?.creds?.registered) {
    const numero = "TU_NUMERO_SIN_EL_+";

    setTimeout(async () => {
      try {
        const codigo = await sock.requestPairingCode(numero);
        console.log("================================");
        console.log("🔗 CÓDIGO PARA VINCULAR WHATSAPP:");
        console.log(codigo);
        console.log("================================");
      } catch (error) {
        console.log("❌ Error generando código:", error);
      }
    }, 3000);
  }

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ DANIBOT CONECTADO A WHATSAPP");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ Conexión cerrada.");

      if (shouldReconnect) {
        console.log("🔄 Reconectando...");
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
`╭━━〔 🤖 DANIBOT 〕━━╮

👋 Hola, soy Danibot

📋 COMANDOS

• .menu
• .ping
• .hola

╰━━━━━━━━━━━━━━╯`
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
