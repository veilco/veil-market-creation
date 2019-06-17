exports.up = async function(knex, Promise) {
  await knex.schema.createTable("draft_markets", function(t) {
    t.timestamps(true, true);
    t.increments();

    t.string("description");
    t.string("details");

    t.string("handle")
      .notNullable()
      .unique();

    t.string("token")
      .notNullable()
      .unique();

    t.string("secret")
      .notNullable()
      .unique();
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTable("accounts");
};
