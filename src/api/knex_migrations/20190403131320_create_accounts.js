exports.up = async function(knex, Promise) {
  await knex.schema.createTable("accounts", function(t) {
    t.timestamps(true, true);

    t.integer("id")
      .unique()
      .notNullable()
      .index();

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
