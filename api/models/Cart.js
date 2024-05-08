/**
 * Cart.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    user: {
      model: 'User'
    },
    product:
    {
      model: 'Product'
    },
    vendorid:{
      type:'string',
      required:true
    },
    quantity:{
      type:'number',
      required:true
    }
  },
};

