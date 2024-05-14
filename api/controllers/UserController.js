/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
const blacklist = [];
module.exports = {

  //Endpoint for registering the user
  registerUser: async(req, res) => {
    const {firstName, lastName, email, password} = req.body;

    if(!firstName || !lastName || !email || !password){
      return res.json({
        message: 'Each and every is required to enter',
      });
    }
    const checkTableQuery = 'SHOW TABLES LIKE "User"';
    const tableExistsResult = await sails.sendNativeQuery(checkTableQuery);
    if(tableExistsResult.rows.length===0){
      const createTableQuery = `
        CREATE TABLE User (
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstName VARCHAR(255) NOT NULL,
            lastName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
        )`;
      await sails.sendNativeQuery(createTableQuery);
    }
    const userExistQuery = 'SELECT email from User where email = $1';
    const queryParamss = [email];
    const userExistResult = await sails.sendNativeQuery(userExistQuery, queryParamss);
    if(userExistResult.rows.length > 0){
      return res.json({
        message: 'User already exist'
      });
    }
    const createUserQuery = 'INSERT INTO User (firstName, lastName, email, password) VALUES ($1, $2, $3, $4)';
    const hashedPassword = await bcrypt.hash(password,10);
    const queryParams = [firstName, lastName, email, hashedPassword];
    const userCreated = await sails.sendNativeQuery(createUserQuery, queryParams);
    if(userCreated.affectedRows > 0){
      const id = userCreated.insertId;
      const findUserQuery = 'SELECT * FROM User WHERE id = $1';
      const findUserParams = [id];
      const userFoundResult = await sails.sendNativeQuery(findUserQuery, findUserParams);
      return res.json({
        message: 'User has been created',
        User:userFoundResult.rows,
      });
    }
  },

  //Endpoint for user login
  loginUser: async(req,res) => {
    const {email, password} = req.body;
    const loginUserQuery = 'SELECT * FROM User WHERE email = $1';
    const loginUserParams = [email];
    const loginUserResult = await sails.sendNativeQuery(loginUserQuery,loginUserParams);
    if(loginUserResult.rows.length<=0){
      return res.json({
        message:'No user found with this email'
      });
    }
    const user = loginUserResult.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password);
    if(matchPassword){
      const tokenObject = {
        firstname: user.firstName,
        lastname: user.lastName,
        id: user.id,
        email: user.email,
      };
      const token = await jwt.sign(tokenObject, 'abcde', {expiresIn:'4h'});
      return res.json({
        message:'You are logged in successfully',
        tokenObject,
        token,
      });
    }
    else{
      return res.json({
        message:'You have entered incorrect password please enter the correct password',
      });
    }
  },

  //Endpoint for user logout
  userLogout: async function(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    blacklist.push(token);
    return res.ok({ message: 'Logged out successfully' });
  },

  getUsers: async(req, res) => {
    const getUserQuery = 'SELECT * FROM User';
    const getUserResult = await sails.sendNativeQuery(getUserQuery);
    if(getUserResult.rows.length>0){
      return res.json({
        message:'All registered users are as follows',
        Users:getUserResult.rows,
      });
    }
    else{
      return res.json({
        message:'No users found',
      });
    }
  },

  //Endpoint for getting the user by id
  getUserById: async(req, res) => {
    const id = req.params.userid;
    const getUserQuery = 'SELECT * FROM User WHERE id = $1';
    const getUserParams = [id];
    const getUserResult = await sails.sendNativeQuery(getUserQuery, getUserParams);
    if(getUserResult.rows.length>0){
      return res.json({
        message:'All registered users are as follows',
        Users:getUserResult.rows,
      });
    }
    else{
      return res.json({
        message:'No user found with this ID',
      });
    }
  },

  //Endpoint for updating the existing user
  updateUser: async(req,res) => {
    const id = req.params.userid;
    const {firstName, email} = req.body;
    let updateUserQuery = 'UPDATE User SET ';
    const updateUserParams = [];

    if (firstName) {
      updateUserQuery += 'firstName = $1, ';
      updateUserParams.push(firstName);
    }
    if (email) {
      updateUserQuery += 'email = $2, ';
      updateUserParams.push(email);
    }
    updateUserQuery = updateUserQuery.slice(0, -2);
    const lengthOfArray = updateUserParams.length;
    updateUserQuery += ` WHERE id = $${lengthOfArray + 1}`;
    updateUserParams.push(id);
    const updateResult = await sails.sendNativeQuery(updateUserQuery, updateUserParams);

    const getUpdatedUserQuery = `SELECT * FROM User where id=$1`;
    const getUpdatedUserParams = [id];
    const getUpdatedUserResult = await sails.sendNativeQuery(getUpdatedUserQuery, getUpdatedUserParams);
    if(updateResult.affectedRows>0){
      return res.json({
        message:'User has been updated successfully',
        UpdatedUser:getUpdatedUserResult.rows[0],
      });
    }
  },

  //Endpoint used for reset the user password
  resetUserPassword: async(req,res) => {
    const {email, oldpassword, newpassword} = req.body;
    const findUserQuery = 'SELECT * FROM User WHERE email = $1';
    const findUserParams = [email];
    const userFoundResult = await sails.sendNativeQuery(findUserQuery, findUserParams);
    if(userFoundResult.rows.length===0){
      return res.json({
        message:'No user found with this mail id',
      });
    }
    const user = userFoundResult.rows[0];
    const passwordMatch = await bcrypt.compare(
      oldpassword,
      user.password
    );
    if(!passwordMatch){
      return res.json({
        message:'Password is not correct please enter correct password'
      });
    }
    const hashedPassword = await bcrypt.hash(newpassword,10);
    const updateFieldQuery = 'UPDATE User SET password = $1 WHERE email = $2';
    const updateFieldParams = [hashedPassword, email];
    const updateFieldResult = await sails.sendNativeQuery(updateFieldQuery, updateFieldParams);
    if(updateFieldResult.affectedRows>0){
      return res.json({
        message:'Your password has been changed successfully',
      });
    }
  },
};

