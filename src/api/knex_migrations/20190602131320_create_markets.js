exports.up = async function(knex, Promise) {
  await knex.schema.createTable("markets", function(t) {
    t.timestamps(true, true);
    t.increments();
    t.string("uid")
      .unique()
      .index()
      .notNullable();
    t.text("description").notNullable();
    t.text("details").notNullable();
    t.text("resolutionSource");
    t.datetime("endTime").notNullable();
    t.jsonb("tags").defaultTo("[]");
    t.string("category").notNullable();
    t.decimal("marketCreatorFeeRate", 12, 10).notNullable();
    t.string("author").notNullable();
    t.string("transactionHash");
    t.string("status")
      .index()
      .notNullable();
    t.string("type").notNullable();
    t.string("address");

    t.decimal("minPrice", 78, 0);
    t.decimal("maxPrice", 78, 0);
    t.decimal("numTicks", 78, 0);
    t.string("scalarDenomination");

    t.jsonb("metadata");
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTable("markets");
};
