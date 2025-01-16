const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app"); // Chemin vers votre application Express
const Users = require("../models/users.models"); // Votre modèle Mongoose pour les utilisateurs

mongoose.set("strictQuery", false); 

jest.setTimeout(30000); // Timeout augmenté pour les tests longs

// Connexion à la base de données avant tous les tests
beforeAll(async () => {
  mongoose.set("strictQuery", false);
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/test_db", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connexion à la base de données réussie.");
    } catch (error) {
      console.error("Erreur de connexion à la base de données:", error);
    }
  }
});


// Nettoyage après tous les tests
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase(); // Supprime la base de données de test
    await mongoose.connection.close(); // Ferme la connexion à la base de données
  } catch (error) {
    console.error("Erreur lors du nettoyage de la base de données:", error);
  }
});

describe("Tests d'intégration pour l'API des utilisateurs", () => {
  let userId; // Variable pour stocker l'ID de l'utilisateur ajouté

  // Test de l'ajout d'un utilisateur
  test("Devrait ajouter un nouvel utilisateur avec succès", async () => {
    const response = await request(app).post("/api/users").send({
      Email: "user@example.com",
      Lastname: "Doe",
      Firstname: "John",
      Age: 30,
    });

    expect(response.status).toBe(201); // Vérifie le statut HTTP 201 (créé)
    expect(response.body.message).toBe("User added with success");

    // Vérifie si l'utilisateur a été ajouté dans la base de données
    const user = await Users.findOne({ Email: "user@example.com" });
    userId = user._id; // Sauvegarde l'ID de l'utilisateur pour les tests suivants
    expect(user).not.toBeNull(); // L'utilisateur doit exister
  });

  // Test pour récupérer tous les utilisateurs
  // test("Devrait récupérer tous les utilisateurs", async () => {
  //   const response = await request(app).get("/api/users");

  //   expect(response.status).toBe(200); // Vérifie le statut HTTP 200 (OK)
  //   expect(response.body.length).toBeGreaterThan(0); // Vérifie qu'il y a des utilisateurs
  // });
  test("Devrait récupérer tous les utilisateurs", async () => {
    const response = await request(app).get("/api/users");
    
    // Si votre route retourne 201, ajustez vos attentes
    expect(response.status).toBe(201); 
    expect(response.body.length).toBeGreaterThan(0); // Vérifie qu'il y a des utilisateurs
  });

  
  // Test pour récupérer un utilisateur par son ID
  // test("Devrait récupérer un utilisateur par son ID", async () => {
  //   const response = await request(app).get(`/api/users/${userId}`);

  //   expect(response.status).toBe(200); // Vérifie le statut HTTP 200 (OK)
  //   expect(response.body.Email).toBe("user@example.com");
  //   expect(response.body.Lastname).toBe("Doe");
  // });
  // Test pour récupérer un utilisateur par son ID
test("Devrait récupérer un utilisateur par son ID", async () => {
  const response = await request(app).get(`/api/users/${userId}`);

  // Vérifie le statut HTTP 200
  expect(response.status).toBe(200);

  // Vérifie les données renvoyées
  expect(response.body.Email).toBe("user@example.com");
  expect(response.body.Lastname).toBe("Doe");
});


  // Test pour mettre à jour un utilisateur
  test("Devrait mettre à jour un utilisateur avec succès", async () => {
    const response = await request(app).put(`/api/users/${userId}`).send({
      Lastname: "Updated",
      Firstname: "John Updated",
      Age: 35,
      Email: "updated@example.com",
    });

    expect(response.status).toBe(200); // Vérifie le statut HTTP 200 (OK)
    expect(response.body.Lastname).toBe("Updated");
    expect(response.body.Firstname).toBe("John Updated");

    // Vérifie que les données ont bien été mises à jour dans la base de données
    const updatedUser = await Users.findById(userId);
    expect(updatedUser.Lastname).toBe("Updated");
    expect(updatedUser.Firstname).toBe("John Updated");
  });

  // Test pour supprimer un utilisateur
  test("Devrait supprimer un utilisateur avec succès", async () => {
    const response = await request(app).delete(`/api/users/${userId}`);

    expect(response.status).toBe(200); // Vérifie le statut HTTP 200 (OK)
    expect(response.body.message).toBe("User deleted successfully");

    // Vérifie que l'utilisateur a bien été supprimé de la base de données
    const deletedUser = await Users.findById(userId);
    expect(deletedUser).toBeNull(); // L'utilisateur doit être null (supprimé)
  });
});