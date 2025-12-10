const webpush = require("web-push");

module.exports = async (req, res) => {
  // Se alguém acessar via GET no navegador, só responde ok
  if (req.method === "GET") {
    return res.status(200).json({ message: "API DezEmbarcar Push online. Use POST." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
  const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
  const contactEmail =
    process.env.VAPID_CONTACT || "mailto:seuemail@exemplo.com";

  if (!publicVapidKey || !privateVapidKey) {
    console.error("VAPID KEY AUSENTE", {
      hasPublic: !!publicVapidKey,
      hasPrivate: !!privateVapidKey,
    });
    return res
      .status(500)
      .json({ error: "VAPID keys não configuradas no servidor." });
  }

  // Configura o Web Push com suas chaves VAPID
  webpush.setVapidDetails(contactEmail, publicVapidKey, privateVapidKey);

  const { subscription, title, body } = req.body || {};

  if (!subscription) {
    return res
      .status(400)
      .json({ error: "Subscription (inscrição do navegador) é obrigatória." });
  }

  const payload = JSON.stringify({
    title: title || "Notificação DezEmbarcar",
    body: body || "Nova atualização da sua viagem.",
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("Erro ao enviar push:", err);
    return res.status(500).json({ error: "Erro ao enviar notificação." });
  }
};
