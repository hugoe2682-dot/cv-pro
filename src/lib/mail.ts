import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "CV Pro <onboarding@resend.dev>";

export const sendConfirmationCode = async (email: string, code: string) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Votre code d'activation - CV Pro",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #4f46e5; text-align: center;">Activation de votre compte</h1>
          <p>Bonjour,</p>
          <p>Merci de vous être inscrit sur CV Pro. Pour activer votre compte, veuillez utiliser le code de confirmation suivant :</p>
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${code}</span>
          </div>
          <p>Ce code est valable pendant 10 minutes.</p>
          <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">© 2026 CV Pro. Tous droits réservés.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur Resend (confirmation):", error);
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Bienvenue sur CV Pro !",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:20px;">
            <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px;">
              <h2 style="color:#333;">Bienvenue sur CV Pro 👋</h2>
              <p>Bonjour <b>${name}</b>,</p>
              <p>
                Votre inscription a été effectuée avec succès et votre compte est maintenant actif.
              </p>
              <p>
                Grâce à <b>CV Pro</b>, vous pouvez créer un CV professionnel moderne et prêt pour vos candidatures en quelques minutes.
              </p>
              <h3>✨ Fonctionnalités disponibles :</h3>
              <ul>
                <li>Création rapide de CV professionnels</li>
                <li>Modèles modernes et élégants</li>
                <li>Téléchargement en PDF</li>
                <li>Modification facile à tout moment</li>
              </ul>
              <p style="text-align:center; margin:30px 0;">
                <a href="${siteUrl}"
                   style="background:#4f46e5; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px;">
                  Accéder à mon espace
                </a>
              </p>
              <p>
                Et en plus, c’est <b>gratuit</b> 🎉
              </p>
              <p>
                Merci de faire confiance à CV Pro pour votre parcours professionnel.
              </p>
              <br/>
              <p>Cordialement,</p>
              <p><b>B. Madjid</b><br/>Fondateur et CEO de CV Pro</p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Erreur Resend (welcome):", error);
  }
};
