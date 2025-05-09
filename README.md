Descripció del projecte:

FindIt és un joc interactiu en el qual els usuaris reben un repte aleatori: trobar un objecte concret del món real (per exemple, "una tassa", "una pilota", "una planta"). El jugador haurà de fer-li una foto amb el seu dispositiu i pujar-la a l’aplicació. El sistema comprovarà automàticament si l’objecte que apareix coincideix amb el repte utilitzant reconeixement d’imatges. Si l’encerta, guanya punts i avança de nivell!

Arquitectures i tecnologies a fer servir al Projecte:

L’aplicació compta amb una interfície mòbil (o web) des d’on els usuaris poden rebre reptes i pujar imatges. Quan es puja una foto, es fa una crida a Google Cloud Vision API per detectar els objectes presents. El sistema compara les etiquetes retornades amb l’objecte esperat. La puntuació i l’historial de jugades es guarden a Firebase.
La lògica principal es desenvoluparà amb JavaScript (React o Flutter), i es gestionarà amb Cloud Functions si cal afegir lògica personalitzada de backend.

Llistat del productes de google cloud i serveis a utilitzar:

• Cloud Vision API ->per detectar objectes en imatges.
• Firebase Authentication -> per gestionar usuaris.
• Firebase Firestore -> per guardar puntuacions i reptes.
• Cloud Storage -> per desar temporalment les imatges pujades.
• Cloud Functions -> per a la lògica del joc i comprovacions automàtiques.

Pantalles:

- Login/Register -> pantalla on l'usuàri s'haurà d'identificar.
- Home -> Resum estadístiques, ratxes/ranking i punts
- Jugar en diferents modes:
	- Normal -> Et posa un repte i un temps determinat per a trobar l'objecte i si el fas bé dins el temps establert, et proposa el seguent fins a que fallis.
	- Contrarrellotge -> Donat un temps fixe (ex. 10 minuts) trobar el màxim d'objectes possibles.
- Configuració -> Opció d'editar el perfil i logout (de moment).
