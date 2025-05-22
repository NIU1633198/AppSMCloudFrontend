const {onCall} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const vision = require("@google-cloud/vision");

// Inicializa Admin SDK
initializeApp();

// Cliente de Vision
const client = new vision.ImageAnnotatorClient();

exports.analizarImagen = onCall(async (request) => {
  console.log("📥 Recibido en backend:", request);

  const imageUrl = request.data && request.data.imageUrl;
  if (!imageUrl) {
    throw new Error("❌ Falta la URL de la imagen");
  }

  try {
    const [result] = await client.labelDetection(imageUrl);
    const labels = result.labelAnnotations || [];
    const etiquetas = labels.map((label) => label.description.toLowerCase());
    console.log("✅ Etiquetas:", etiquetas);
    return {etiquetas};
  } catch (err) {
    console.error("❌ Error con Vision API:", err);
    throw new Error("Error interno al analizar la imagen");
  }
});
