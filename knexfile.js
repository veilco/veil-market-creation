require("dotenv").config();
const { camelizeKeys, decamelize } = require("humps");

const camelizeProcessors = {
  wrapIdentifier(value, next) {
    return next(decamelize(value));
  },
  postProcessResponse(result) {
    return camelizeKeys(result);
  }
};

module.exports = {
  development: {
    client: "postgresql",
    connection: process.env.POSTGRES_URL || {
      user: "veil",
      host: "127.0.0.1",
      port: "5432",
      database: "veil_market_creation"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/api/knex_migrations"
    },
    ...camelizeProcessors
  },

  test: {
    client: "postgresql",
    connection: process.env.POSTGRES_URL_TEST || {
      user: "veil",
      host: "127.0.0.1",
      port: "5432",
      database: "veil_market_creation_test"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/api/knex_migrations"
    },
    ...camelizeProcessors
  },

  production: {
    client: "postgresql",
    connection:
      process.env.DATABASE_URL +
      (!!process.env.POSTGRES_SSL ? "?ssl=true" : ""),
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/api/knex_migrations"
    },
    ...camelizeProcessors
  }
};
