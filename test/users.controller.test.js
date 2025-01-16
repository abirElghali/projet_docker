
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app"); // Remplacez par le chemin vers votre fichier de configuration de l'application
const Users = require("../models/users.models");

jest.setTimeout(30000); // Augmenter le délai d'attente pour les tests

beforeAll(async () => {
  try {
    console.log("Avant les tests : Connexion à la base de données...");
    await mongoose.connect("mongodb://127.0.0.1:27017/abeer", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB CONNECTED");
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données :", error);
  }
});


// Nettoyage de la base de données après les tests
afterAll(async () => {
  console.log("Après les tests : Nettoyage de la base de données...");
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Déclaration de la suite de tests pour les utilisateurs
describe("Users Controller Tests", () => {
  let userId;

  test("Should add a new user successfully", async () => {
    const response = await request(app).post("/api/users").send({
      Email: "test@example.com",
      Lastname: "Doe", // Ajouté
      Firstname: "John", // Ajouté
      Age: 30, // Ajouté
    });

    console.log(response.body); // Log pour le débogage

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User added with success");

    const user = await Users.findOne({ Email: "test@example.com" });
    userId = user ? user._id : undefined; // Assurez-vous que userId est défini
    expect(user).not.toBeNull(); // Assurez-vous que l'utilisateur existe dans la DB
  }, 10000);

  test("Should not add user with existing email", async () => {
    const response = await request(app).post("/api/users").send({
      Email: "test@example.com",
      Lastname: "Doe", // Ajouté
      Firstname: "John", // Ajouté
      Age: 30, // Ajouté
    });

    console.log(response.body); // Log pour le débogage

    expect(response.status).toBe(404);
    expect(response.body.Email).toBe("User Exist");
  }, 10000);

  test("Should retrieve all users", async () => {
    const response = await request(app).get("/api/users");

    console.log(response.body); // Log pour le débogage

    expect(response.status).toBe(201);
    expect(response.body.length).toBeGreaterThan(0); // Vérifiez qu'il y a des utilisateurs dans la DB
  });

  test("Should retrieve a single user", async () => {
    if (!userId) {
      console.log("userId is not set, skipping this test.");
      return; // Ignorez ce test si userId n'est pas défini
    }

    const response = await request(app).get(`/api/users/${userId}`);

    console.log(response.body); // Log pour le débogage

    expect(response.status).toBe(200);
    expect(response.body.Email).toBe("test@example.com");
  });

  test("Should update a user successfully", async () => {
    if (!userId) {
      console.log("userId is not set, skipping this test.");
      return; // Ignorez ce test si userId n'est pas défini
    }

    const response = await request(app).put(`/api/users/${userId}`).send({
      Lastname: "Updated",
      Firstname: "John Updated",
      Age: 35, // Ajouté
      Email: "updated@example.com",
    });

    console.log(response.body); // Log pour le débogage

    expect(response.status).toBe(200);
    expect(response.body.Lastname).toBe("Updated");
    expect(response.body.Firstname).toBe("John Updated");
  });

  test("Should delete a user successfully", async () => {
    if (!userId) {
      console.log("userId is not set, skipping this test.");
      return; // Ignorez ce test si userId n'est pas défini
    }

    const response = await request(app).delete(`/api/users/${userId}`);

    console.log(response.body); // Log pour le débogage

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User deleted successfully");
  });
});