/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  'POST /users/registeruser' : 'UserController.registerUser',
  'POST /users/loginuser' : 'UserController.loginUser',
  'POST /users/logout' : 'UserController.userLogout',
  'GET /users/getusers' : 'UserController.getUsers',
  'GET /users/getuserbyid/:userid' : 'UserController.getUserById',
  'PATCH /users/updateuser/:userid' : 'UserController.updateUser',

  'POST /categories/addcategory' : 'CategoryController.addCategory',
  'GET /categories/getallcategories' : 'CategoryController.getAllCategories',
  'GET /categories/getcategory/:categoryid' : 'CategoryController.getCategory',
  'PATCH /categories/updatecategory/:categoryid' : 'CategoryController.updateCategory',
  'DELETE /categories/deletecategory/:categoryid' : 'CategoryController.deleteCategory',

  'POST /products/addproduct' : 'ProductController.addProduct',
  'GET /products/getproductbycategory/:categoryid' : 'ProductController.getProductByCategory',
  'GET /products/getproductbyproduct/:productid' : 'ProductController.getProductByProductId',
  'PATCH /products/updateproduct/:productid' : 'ProductController.updateProduct',
  'DELETE /products/deleteproduct/:productid' : 'ProductController.deleteProduct',
  'GET /products/searchproduct/' : 'ProductController.searchProduct',


  'POST /cart/addtocart' : 'CartController.addToCart',
  'GET /cart/cartwithproduct/:userid' : 'CartController.getUsersCart',
  'PATCH /cart/quantityofproduct/:cartid' : 'CartController.updateQuantityOfProduct',
  'DELETE /cart/deletefromcart/:cartid' : 'CartController.deleteProductFromCart',
};
