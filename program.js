//HASHING PASSWORD USING BCRYPT
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const jwt = require("jsonwebtoken");
const secretKey = "chikki@gmail.com";
let token = "";

//MOCKED/DUMMY DB FOR STORING USER DATA/INFORMATION
const dB = {
  users: [],
  admins: [],
};

//FUNCTION TO CREATE ALL USERS/ADMINS BASED ON THE /PATH
//GLOBAL VARIABLE THAT CHECKS IF AN EXIST FROM THE USER INPUT
const errorExist = [];
const createUser = (req, res) => {
  const path = req.path;
  const userDetails = req.body;

  //HERE FOR ALL FNX CALLS
  //CHECKS TO SEE IF ANY INPUT FIELD IS EMPTY AND UPDATES THE ARRAY
  isEmpty(userDetails);

  //CHECKING IF MAIN PASSWORD MATCHES CONFIRM PASSWORD
  passwordMatch(userDetails);

  //CHECKING IF A USER ENTERS A VALID EMAIL
  emailValidation(userDetails);

  //THIS FNX ADDS USER TO DB IF USER IS NOT IN EXISTENCE
  isUserExisting(userDetails, dB, path);

  //THIS PART RUNS THE WHOLE CODE IF ALL VALIDATION CHECKED ARE CORRECT AND PUSHES TO THE DATABASE
  if (errorExist.length < 1) {
    if (path == "/user") {
      //OBJECT DESTRUCTURING
      let { firstName, lastName, email, password } = userDetails;
      let newPassword = bcrypt.hashSync(password, salt);
      let addingUserToDatabase = { firstName, lastName, email, newPassword };
      dB.users.push(addingUserToDatabase);
      res.status(201).json({ status: "created", message: "user created" });
    } else if (path == "/admin") {
      let { firstName, lastName, email, password } = userDetails;
      let newPassword = bcrypt.hashSync(password, salt);
      let addingUserToDatabase = { firstName, lastName, email, newPassword };
      dB.admins.push(addingUserToDatabase);
      res.status(201).json({ status: "created", message: "admin created" });
    }
  } else {
    res.status(400).json({
      status: "failed",
      message: `Please attend to the followings:${errorExist}`,
    });
  }
};

//THIS FNX CHECKS IF USER DETAILS/INPUT IS EMPTY
const isEmpty = (userdetails) => {
  for (let detail in userdetails) {
    //ADD THE EMPTY FIELDS TO THE ERROR ARRAY
    if (errorExist.includes(detail) == false) {
      if (userdetails[detail] == "") {
        errorExist.push(detail);
      }
    } else {
      if (userdetails[detail] != "") {
        let index = errorExist.indexOf(detail);
        errorExist.splice(index, 1);
      }
    }
  }
};

//THIS FNX CHECK IF PASSWORD MATCHES CONFIRM PASSWORD
const passwordMatch = (userdetails) => {
  if (userdetails.password !== userdetails.confirmPassword) {
    if (errorExist.includes("passwordNotMatched") == false) {
      errorExist.push("passwordNotMatched");
    }
  } else {
    if (errorExist.includes("passwordNotMatched") == true) {
      let index = errorExist.indexOf("passwordNotMatched");
      errorExist.splice(index, 1);
    }
  }
};

//FNX THAT CHECKS FOR EMAIL VALIDATION
function emailValidation(userdetails) {
  const regEx = /^[^0-9][a-zA-Z0-9._%+-]+@[a-zA-Z]+(\.[a-zA-Z]+)+$/;
  if (regEx.test(userdetails.email) == false) {
    if (errorExist.includes("invalid email") == false) {
      errorExist.push("invalid email");
    }
  } else {
    if (errorExist.includes("invalid email") == true) {
      let index = errorExist.indexOf("invalid email");
      errorExist.splice(index, 1);
    }
  }
}

//FNX TO CHECK FOR AN EXISTING USER
function isUserExisting(userdetails, database, path) {
  const email = userdetails.email;
  //FILTERING THE DATABASE TO CHECK IF USER EXIST ALREADY B4 CREATING A NEW USER
  if (path == "/user") {
    userIndexInDB = database.users.findIndex((user) => user.email == email);
  } else if (path == "/admin") {
    userIndexInDB = database.admins.findIndex((user) => user.email == email);
  }
  //POPS OUT USER IF ALREADY IN THE DATABASE
  const index = errorExist.indexOf("User Exist");
  if (index >= 0) {
    errorExist.splice(index, 1);
  }

  if (userIndexInDB >= 0) {
    if (errorExist.includes("User Exist") == false) {
      errorExist.push("User Exist");
    }
  }
}

// FUNCTION TO GET USERS/ADMINS BASED ON THE /PATH FROM OUR DATABASE(GET REQUEST)
const getAllUsers = (req, res) => {
  const path = req.path;
  if (path == "/users") {
    res.status(200).json({ status: "ok", users: dB.users });
  } else if (path == "/admins") {
    res.status(200).json({ status: "ok", admins: dB.admins });
  }
};

//LOGIN VALIDATION(POST REQUEST)/// FNX TO LOGIN ALREADY EXISTING USER
const userLogin = (req, res) => {
  const { email, password } = req.body;
  if (email == "" || password == "") {
    res
      .status(404)
      .json({ status: "failed", msg: "pls enter email or password" });
  } else {
    const userExist = dB.users.filter((user) => user.email === email);
    if (userExist.length == 0) {
      res.status(404).json({ status: "failed", msg: "User not found" });
    } else {
      if (bcrypt.compareSync(password, userExist[0].newPassword)) {
        token = jwt.sign({ email }, secretKey, { expiresIn: "500000ms" });
        res
          .status(200)
          .json({ status: "success", message: "User Login", token });
      } else {
        res.status(404).json({ status: "failed", message: "Oops! wrong user" });
      }
    }
  }
};

module.exports = { getAllUsers, createUser, userLogin };
