const webpush = require("web-push");

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const contactEmail = process.env.VAPID_CONTACT || "mailto:seuemail@exemplo.com";

// Configura o Web Push com suas chaves VAPID
webpush.setVapidDetails(contactEmail, publicVapidKey, privateVapidKey);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido. Use POST." });
    return;
  }

  const { subscription, title, body } = req.body || {};

  if (!subscription) {
    res.status(400).json({ error: "Subscription (inscrição do navegador) é obrigatória." });
    return;
  }

  const payload = JSON.stringify({
    title: title || "Notificação DezEmbarcar",
    body: body || "Nova atualização da sua viagem.",
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Erro ao enviar push:", err);
    res.status(500).json({ error: "Erro ao enviar notificação." });
  }
};
