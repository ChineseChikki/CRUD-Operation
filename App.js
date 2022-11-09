// importing express module
const express = require("express");
const app = express();
const port = 3000;

//(TWO BAD GUYS MIDDLEWARE)
app.use(express.json()); //ALLOWS FOR JSON FORMAT(IN POSTMAN)
app.use(express.urlencoded({ extended: false })); //ALLOWS FOR FORM FORMAT(IN POSTMAN)

//WE IMPORT OUR NEEDED MODULES HERE
// DESTRUCTURING OF OBJECTS
const { getAllUsers, createUser, userLogin } = require("./program");

//GETTING ALL USERS / ADMINS FROM OUR DATABASE
app.get("/users", getAllUsers);
app.get("/admins", getAllUsers);

//CREATING ALL USERS / ADMINS AND STORING THEIR DATA IN OUR DATABASE
app.post("/user", createUser);
app.post("/admin", createUser);
// FNX TO LOGIN ALREADY EXISTING USER
app.post("/auth/login", userLogin);

//STARTING UP OUR SERVER AT PORT 3000
app.listen(port, () => {
  console.log(`server listening at port ${port}`);
});
