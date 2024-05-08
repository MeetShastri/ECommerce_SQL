/**
 * CartController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  addToCart: async(req, res) => {
    const {user, product, vendorid, quantity} = req.body;
    if(!user || !product || !vendorid || !quantity){
      return res.json({
        message:'All fields are required',
      });
    }
    const checkTableQuery = 'SHOW TABLES LIKE "Cart"';
    const tableExistsResult = await sails.sendNativeQuery(checkTableQuery);
    if(tableExistsResult.rows.length===0){
      const createTableQuery = `
            CREATE TABLE Cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user INT NOT NULL,
                product INT NOT NULL,
                vendorid INT NOT NULL,
                quantity INT NOT NULL
            )`;
      await sails.sendNativeQuery(createTableQuery);
    }
    const addToCartQuery = 'INSERT INTO Cart (user, product, vendorid, quantity) VALUES ($1, $2, $3, $4)';
    const addToCartParams = [user, product, vendorid, quantity];
    const addToCartResult = await sails.sendNativeQuery(addToCartQuery, addToCartParams);
    if(addToCartResult.affectedRows>0){
      const id = addToCartResult.insertId;
      const getCartProductQuery = 'SELECT * FROM Cart WHERE id = $1';
      const getCartProductParams = [id];
      const getCartProductResult = await sails.sendNativeQuery(getCartProductQuery, getCartProductParams);
      return res.json({
        message:'Product has been added to Cart',
        CartProduct:getCartProductResult.rows,
      });
    }
  },

  getUsersCart: async(req, res) => {
    const id = req.params.userid;
    const getCartWithProductsQuery = `SELECT * FROM Product INNER JOIN Cart ON Product.id = Cart.product WHERE user = $1`;
    const getCartWithProductsParams = [id];
    const getCartWithProductsResult = await sails.sendNativeQuery(getCartWithProductsQuery, getCartWithProductsParams);
    if(getCartWithProductsResult.rows.length<=0){
      return res.json({
        message:'No Products in cart for this user',
      });
    }
    if(getCartWithProductsResult.rows.length>0){
      const CartWithProductDetails = getCartWithProductsResult.rows.map(cart => ({
        id: cart.id,
        user: cart.user,
        product:{
          id: cart.id,
          title: cart.title,
          description: cart.description,
          category: cart.category,
          price: cart.price,
          manufacturer: cart.manufacturer,
          review: cart.review
        },
        vendorid: cart.vendorid,
        quantity: cart.quantity
      }));
      if(CartWithProductDetails.length<=0){
        return res.json({
          message:'There is nothing in cart pls add something in cart'
        });
      }
      else{
        return res.json({
          message:'Products in cart are this',
          ProductsInCart:CartWithProductDetails,
        });
      }
    }
  },

  updateQuantityOfProduct: async(req, res) => {
    const id = req.params.cartid;
    const {quantity} = req.body;
    const updateQuantityOfProductQuery = 'UPDATE Cart SET quantity = $1 WHERE id = $2';
    const updateQuantityOfProductParams = [quantity, id];
    const updateQuantityOfProductResult = await sails.sendNativeQuery(updateQuantityOfProductQuery, updateQuantityOfProductParams);
    if(updateQuantityOfProductResult.affectedRows>0){
      const getUpdatedDataQuery = 'SELECT * FROM Cart WHERE id = $1';
      const getUpdatedDataParams = [id];
      const getUpdatedDataResult = await sails.sendNativeQuery(getUpdatedDataQuery, getUpdatedDataParams);
      return res.json({
        message:'Quantity has been updated',
        UpdatedData: getUpdatedDataResult.rows,
      });
    }
  },

  deleteProductFromCart: async(req, res) => {
    const id = req.params.cartid;
    const findProductQuery = 'SELECT * FROM Cart WHERE id = $1';
    const findProductParams = [id];
    const findProductResult = await sails.sendNativeQuery(findProductQuery, findProductParams);
    if(findProductResult.rows.length === 0){
      return res.json({
        message:'No product with this id is found in cart',
      });
    }
    const deleteFromCartQuery = 'DELETE FROM Cart WHERE id = $1';
    const deleteFromCartParams = [id];
    const deleteFromCartResult = await sails.sendNativeQuery(deleteFromCartQuery, deleteFromCartParams);
    if(deleteFromCartResult.affectedRows>0){
      return res.json({
        message:'Product has been deleted from the cart',
        DeletedProduct:findProductResult.rows,
      });
    }
  }

};

