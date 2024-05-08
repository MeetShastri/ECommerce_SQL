/**
 * Product.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    title:{
      type:'string',
      required:true
    },
    description:{
      type:'string',
      required:true
    },
    category:{
      model:'Category',
      required:true
    },
    price:{
      type:'number',
      required:true,
    },
    stockquantity:{
      type:'number',
      required:true
    },
    manufacturer:{
      type:'string',
      required:true
    },
    review:{
      type:'number',
      required:true
    }

  },

};

