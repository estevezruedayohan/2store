const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');
const { Op, where } = require('sequelize');

class ProductService {
  constructor() {}

  async create(product) {
    const newProduct = await models.Product.create(product);
    if (!newProduct) {
      throw boom.notAcceptable('ALGO SALIO MAL');
    }
    return newProduct;
  }

  async findAll(query) {
    const options = {
      include: ['category'],
      where: {},
    };

    const { limit, offset, price, price_min, price_max } = query;

    if (limit && offset) {
      options.limit = parseInt(limit);
      options.offset = parseInt(offset);
    }

    if (price) {
      options.where.price = price;
    }

    if (price_min && price_max) {
      options.where.price = {
        [Op.gte]: price_min,
        [Op.lte]: price_max,
      };
    }

    const products = await models.Product.findAll(options);
    if (products === null) {
      throw boom.notFound('PRODUCTS NOT FOUND');
    }
    return products;
  }

  async findByPk(id) {
    const product = await models.Product.findByPk(id);
    if (product === null) {
      throw boom.notFound('PRODUCT NOT FOUND');
    }
    if (product.isBlock) {
      throw boom.conflict('Product has been BLOCKED');
    }
    return product;
  }

  async update(id, changes) {
    const product = await this.findByPk(id);
    const modifiedProduct = product.update(changes);
    return modifiedProduct;
  }

  async delete(id) {
    const product = await this.findByPk(id);
    await product.destroy();
    return id;
  }
}

module.exports = ProductService;
