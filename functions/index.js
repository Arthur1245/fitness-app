/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true}); // Dit zorgt ervoor dat alle domeinen toegestaan zijn

admin.initializeApp();

// Dit is je Firebase function die een oefening toevoegt
exports.addExercise = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        // Hier kun je de data verwerken die je naar Firebase wilt sturen
        const exercise = req.body; // Verwerkt de JSON-gegevens die je via je webpagina verzendt

        // Verzendt de data naar de Firebase Realtime Database
        admin.database().ref('/exercises').push(exercise)
            .then(() => {
                res.status(200).send('Exercise added successfully');
            })
            .catch((error) => {
                res.status(500).send('Error adding exercise: ' + error);
            });
    });
});


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
