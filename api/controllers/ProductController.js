/**
 * ProductController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {


  addProduct: async(req, res) => {
    const {title, description, category, price, stockquantity, manufacturer, review} = req.body;
    if(!title || !description || !category || !price || !stockquantity || !manufacturer || !review){
      return res.json({
        message:'All fields are required',
      });
    }
    const checkTableQuery = 'SHOW TABLES LIKE "Product"';
    const tableExistsResult = await sails.sendNativeQuery(checkTableQuery);
    if(tableExistsResult.rows.length===0){
      const createTableQuery = `
            CREATE TABLE Product (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                category VARCHAR(255) NOT NULL,
                price INT NOT NULL,
                stockquantity INT NOT NULL,
                manufacturer VARCHAR(255),
                review INT NOT NULL
            )`;
      await sails.sendNativeQuery(createTableQuery);
    }
    const addProductQuery = 'INSERT INTO Product(title, description, category, price, stockquantity, manufacturer, review) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    const addProductParams = [title, description, category, price, stockquantity, manufacturer, review];
    const addProductResult = await sails.sendNativeQuery(addProductQuery, addProductParams);
    if(addProductResult.affectedRows>0){
      const id = addProductResult.insertId;
      const getProductQuery ='SELECT * FROM Product WHERE id = $1';
      const getProductParams = [id];
      const getProductResult = await sails.sendNativeQuery(getProductQuery, getProductParams);
      return res.json({
        message:'Product has been added',
        Product:getProductResult.rows[0],
      });
    }
  },

  getProductByCategory: async(req,res) => {
    const id = req.params.categoryid;
    const findProductByCategoryIdQuery = `SELECT p.*, c.name AS category_name, c.type AS category_type, c.description AS category_description
    FROM Product p
    INNER JOIN Category c ON p.category = c.id
    WHERE c.id = $1`;
    const findProductByCategoryIdParams = [id];
    const findProductByCategoryIdResult = await sails.sendNativeQuery(findProductByCategoryIdQuery, findProductByCategoryIdParams);
    if (findProductByCategoryIdResult.rows.length > 0) {
      const productsWithCategory = findProductByCategoryIdResult.rows.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        category: {
          id: product.category,
          name: product.category_name,
          type: product.category_type,
          description: product.category_description
        },
        price: product.price,
        stockquantity: product.stockquantity,
        manufacturer: product.manufacturer,
        review: product.review
      }));
      return res.json({
        message: 'Products of this category are as follows',
        Products: productsWithCategory
      });
    }
    else{
      return res.json({
        message:'No product found with this category',
      });
    }
  },

  getProductByProductId: async(req, res) => {
    const id = req.params.productid;
    const findProductByProductIdQuery = `SELECT p.*, c.name AS category_name, c.type AS category_type, c.description AS category_description
    FROM Product p
    INNER JOIN Category c ON p.category = c.id
    WHERE p.id = $1`;
    const findProductByProductIdParams = [id];
    const findProductByProductIdResult = await sails.sendNativeQuery(findProductByProductIdQuery, findProductByProductIdParams);
    if(findProductByProductIdResult.rows.length<=0){
      return res.json({
        message:'No product found with this ID'
      });
    }
    const productDetails = findProductByProductIdResult.rows[0];
    const categoryDetails = {
      id: productDetails.category,
      name: productDetails.category_name,
      type: productDetails.category_type,
      description: productDetails.category_description
    };
    const productWithCategory = {
      id: productDetails.id,
      title: productDetails.title,
      description: productDetails.description,
      category: categoryDetails,
      price: productDetails.price,
      stockquantity: productDetails.stockquantity,
      manufacturer: productDetails.manufacturer,
      review: productDetails.review
    };
    return res.json(productWithCategory);
  },

  updateProduct: async(req, res) => {
    const id = req.params.productid;
    const {title, description, price, stockquantity, manufacturer, review} = req.body;
    let updateProductQuery = 'UPDATE Product SET ';
    const updateProductParams = [];

    if (title) {
      updateProductQuery += 'title = $1, ';
      updateProductParams.push(title);
    }
    if (description) {
      updateProductQuery += 'description = $2, ';
      updateProductParams.push(description);
    }
    if (price) {
      updateProductQuery += 'price = $3, ';
      updateProductParams.push(price);
    }
    if (stockquantity) {
      updateProductQuery += 'stockquantity = $4, ';
      updateProductParams.push(stockquantity);
    }
    if (manufacturer) {
      updateProductQuery += 'manufacturer = $5, ';
      updateProductParams.push(manufacturer);
    }
    if (review) {
      updateProductQuery += 'review = $6, ';
      updateProductParams.push(review);
    }
    updateProductQuery = updateProductQuery.slice(0, -2);
    const lengthOfArray = updateProductParams.length;
    updateProductQuery += ` WHERE id = $${lengthOfArray + 1}`;
    updateProductParams.push(id);
    const updateResult = await sails.sendNativeQuery(updateProductQuery, updateProductParams);

    const getUpdatedProductQuery = `SELECT * FROM Product where id=$1`;
    const getUpdatedProductParams = [id];
    const getUpdatedProductResult = await sails.sendNativeQuery(getUpdatedProductQuery, getUpdatedProductParams);
    console.log(getUpdatedProductResult);
    if(updateResult.affectedRows>0){
      return res.json({
        message:'Product has been updated successfully',
        UpdatedProduct:getUpdatedProductResult.rows[0],
      });
    }
  },

  deleteProduct: async(req, res) => {
    const id = req.params.productid;
    const findProductQuery = 'SELECT * FROM Product WHERE id = $1';
    const findProductParams = [id];
    const findProductResult = await sails.sendNativeQuery(findProductQuery, findProductParams);
    if(findProductResult.rows.length<=0){
      return res.json({
        message:'No Product with this id has been found',
      });
    }
    const deleteProductQuery = 'DELETE FROM Product WHERE id = $1';
    const deleteProductParams = [id];
    const deleteProductResult = await sails.sendNativeQuery(deleteProductQuery, deleteProductParams);
    if(deleteProductResult.affectedRows>0){
      return res.json({
        message:'Product has been deleted successfully',
        DeletedProduct:findProductResult.rows,
      });
    }
  },

  searchProduct: async(req, res) => {
    const searchTerm = req.param('q');
    const searchProductQuery = await sails.sendNativeQuery(`SELECT * FROM Product WHERE title LIKE '%${searchTerm}%' OR description LIKE '%${searchTerm}%'`);
    if(searchProductQuery.rows.length>0){
      return res.json({
        message:'Your search is as follows',
        Search:searchProductQuery.rows,
      });
    }
    else{
      return res.json({
        message:'No product found',
      });
    }
  }
};
