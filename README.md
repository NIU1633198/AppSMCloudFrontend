FindIt
📱 Descripción del Proyecto
FindIt es un juego interactivo donde los usuarios reciben un reto aleatorio para encontrar un objeto específico del mundo real (por ejemplo, "una taza", "una pelota", "una planta"). El jugador deberá hacer una foto con su dispositivo y subirla a la aplicación. El sistema comprueba automáticamente si el objeto fotografiado coincide con el reto utilizando tecnología de reconocimiento de imágenes. ¡Si acierta, gana puntos y avanza de nivel!
🛠️ Arquitectura y Tecnologías
La aplicación cuenta con una interfaz móvil (o web) desde donde los usuarios pueden recibir retos y subir imágenes. Cuando se sube una foto, se realiza una llamada a Google Cloud Vision API para detectar los objetos presentes. El sistema compara las etiquetas devueltas con el objeto esperado. La puntuación y el historial de jugadas se almacenan en Firebase.
La lógica principal se desarrollará con JavaScript (React o Flutter), y se gestionará con Cloud Functions para añadir lógica personalizada de backend cuando sea necesario.
☁️ Servicios de Google Cloud

Cloud Vision API: Detección de objetos en imágenes
Firebase Authentication: Gestión de usuarios
Firebase Firestore: Almacenamiento de puntuaciones y retos
Cloud Storage: Almacenamiento temporal de imágenes subidas
Cloud Functions: Lógica del juego y comprobaciones automáticas

📱 Pantallas de la Aplicación
Login/Register

Pantalla donde el usuario deberá identificarse

Home

Resumen de estadísticas
Racha de aciertos/ranking
Puntuación total

Jugar (Modos de juego)

Normal: El sistema propone un reto con tiempo determinado para encontrar el objeto. Si lo consigues dentro del tiempo establecido, se propone el siguiente reto hasta que falles.
Contrarreloj: Con un tiempo fijo (ej. 10 minutos) debes encontrar el máximo número de objetos posibles.

Configuración

Edición de perfil
Logout
Otras opciones (por implementar)
