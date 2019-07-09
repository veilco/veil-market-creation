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
    t.text("resolution_source");
    t.datetime("end_time").notNullable();
    t.datetime("activated_at");
    t.jsonb("tags").defaultTo("[]");
    t.string("category").notNullable();
    t.decimal("market_creator_fee_rate", 12, 10).notNullable();
    t.string("author").notNullable();
    t.string("transaction_hash");
    t.string("status")
      .index()
      .notNullable();
    t.string("type").notNullable();
    t.string("address");

    t.decimal("min_price", 78, 0);
    t.decimal("max_price", 78, 0);
    t.decimal("num_ticks", 78, 0);
    t.string("scalar_denomination");

    t.jsonb("metadata");
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTable("markets");
};
