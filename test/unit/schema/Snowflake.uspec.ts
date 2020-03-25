import * as sinon from "sinon";
import { SnowflakeDialect } from "../../../src";

describe('Snowflake_SchemaBuilder', () => {
  const client = new SnowflakeDialect({ client: 'snowflake' });

  let tableSql: any;
  const equal = require('assert').equal;

  it('basic create table without charset or collate', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.increments('id');
        // @ts-ignore
        this.string('email');
      });
    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "id" int unsigned not null auto_increment primary key, add "email" varchar(255)',
    );
  });

  it('adding json', () => {
    tableSql = client
      .schemaBuilder()
      .table('user', function(t) {
        t.json('preferences');
      });
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "user" add "preferences" variant',
    );
  });

  it('adding jsonb', () => {
    tableSql = client
      .schemaBuilder()
      .table('user', function(t) {
        t.jsonb('preferences');
      });
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "user" add "preferences" variant',
    );
  });

  it('test drop table', () => {
    tableSql = client
      .schemaBuilder()
      .dropTable('users');

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('drop table "users"');
  });

  it('test drop table if exists', () => {
    tableSql = client
      .schemaBuilder()
      .dropTableIfExists('users');

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('drop table if exists "users"');
  });

  it('test drop column', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropColumn('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" drop "foo"');
  });

  it('drops multiple columns with an array', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropColumn(['foo', 'bar']);
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" drop "foo", drop "bar"',
    );
  });

  it('drops multiple columns as multiple arguments', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropColumn('foo', 'bar');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" drop "foo", drop "bar"',
    );
  });

  it('test drop primary', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropPrimary();
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" drop primary key');
  });

  it('test drop unique', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropUnique('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" drop index "users_foo_unique"',
    );
  });

  it('test drop unique, custom', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropUnique(null, 'foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" drop index "foo"');
  });

  it('test drop index', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropIndex('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" drop index "users_foo_index"',
    );
  });

  it('test drop index, custom', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropIndex(null, 'foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" drop index "foo"');
  });

  it('test drop foreign', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropForeign('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" drop foreign key "users_foo_foreign"',
    );
  });

  it('test drop foreign, custom', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropForeign(null, 'foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" drop foreign key "foo"',
    );
  });

  it('test drop timestamps', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.dropTimestamps();
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" drop "created_at", drop "updated_at"',
    );
  });

  it('test rename table', () => {
    tableSql = client
      .schemaBuilder()
      .renameTable('users', 'foo');

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('rename table "users" to "foo"');
  });

  it('test adding primary key', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.primary('foo', 'bar');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add primary key "bar"("foo")',
    );
  });

  it('test adding unique key', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.unique('foo', 'bar');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add unique "bar"("foo")',
    );
  });

  it('test adding index', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.index(['foo', 'bar'], 'baz');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add index "baz"("foo", "bar")',
    );
  });

  it('test adding index with an index type', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.index(['foo', 'bar'], 'baz', 'FULLTEXT');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add FULLTEXT index "baz"("foo", "bar")',
    );
  });

  it('test adding foreign key', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.foreign('foo_id')
          .references('id')
          .on('orders');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add constraint "users_foo_id_foreign" foreign key ("foo_id") references "orders" ("id")',
    );

    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.integer('foo_id')
          .references('id')
          .on('orders');
      });

    equal(2, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo_id" integer');
    expect(tableSql.toSQL()[1].sql).toEqual(
      'alter table "users" add constraint "users_foo_id_foreign" foreign key ("foo_id") references "orders" ("id")',
    );
  });

  it('adding foreign key with specific identifier', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.foreign('foo_id', 'fk_foo')
          .references('id')
          .on('orders');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add constraint "fk_foo" foreign key ("foo_id") references "orders" ("id")',
    );

    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.integer('foo_id')
          .references('id')
          .on('orders')
          .withKeyName('fk_foo');
      });

    equal(2, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo_id" integer');
    expect(tableSql.toSQL()[1].sql).toEqual(
      'alter table "users" add constraint "fk_foo" foreign key ("foo_id") references "orders" ("id")',
    );
  });

  it('adds foreign key with onUpdate and onDelete', () => {
    tableSql = client
      .schemaBuilder()
      .createTable('person', function(table) {
        table
          .integer('user_id')
          .notNullable()
          .references('users.id')
          .onDelete('SET NULL');
        table
          .integer('account_id')
          .notNullable()
          .references('id')
          .inTable('accounts')
          .onUpdate('cascade');
      });
    equal(3, tableSql.toSQL().length);
    expect(tableSql.toSQL()[1].sql).toEqual(
      'alter table "person" add constraint "person_user_id_foreign" foreign key ("user_id") references "users" ("id") on delete SET NULL',
    );
    expect(tableSql.toSQL()[2].sql).toEqual(
      'alter table "person" add constraint "person_account_id_foreign" foreign key ("account_id") references "accounts" ("id") on update cascade',
    );
  });

  it('test adding incrementing id', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.increments('id');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "id" integer unsigned not null auto_increment primary key',
    );
  });

  it('test adding big incrementing id', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.bigIncrements('id');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "id" bigint unsigned not null auto_increment primary key',
    );
  });

  it('test adding string', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.string('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" varchar(255)',
    );
  });

  it('uses the varchar column constraint', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.string('foo', 100);
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" varchar(100)',
    );
  });

  it('chains notNull and defaultTo', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.string('foo', 100)
          .notNullable()
          .defaultTo('bar');
      });
    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" varchar(100) not null default \'bar\'',
    );
  });

  it('allows for raw values in the default field', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.string('foo', 100)
          .nullable()
          // @ts-ignore
          .defaultTo(client.raw('CURRENT TIMESTAMP'));
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" varchar(100) null default CURRENT TIMESTAMP',
    );
  });

  it('test adding text', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.text('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo" text');
  });

  it('test adding big integer', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.bigInteger('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo" bigint');
  });

  it('test adding integer', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.integer('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo" integer');
  });

  it('test adding medium integer', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.mediumint('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" integer',
    );
  });

  it('test adding small integer', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.smallint('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" smallint',
    );
  });

  it('test adding tiny integer', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.tinyint('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo" tinyint');
  });

  it('test adding float', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.float('foo', 5, 2);
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" float(5, 2)',
    );
  });

  it('test adding double', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.double('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo" double');
  });

  it('test adding double specifying precision', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.double('foo', 15, 8);
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" double(15, 8)',
    );
  });

  it('test adding decimal', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.decimal('foo', 5, 2);
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" decimal(5, 2)',
    );
  });

  it('test adding decimal, no precision', () => {
    expect(() => {
      tableSql = client
        .schemaBuilder()
        .table('users', function() {
        // @ts-ignore
        this.decimal('foo', null);
        });
    }).toThrow(
      'Specifying no precision on decimal columns is not supported',
    );
  });

  it('test adding boolean', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.boolean('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo" boolean');
  });

  it('test adding enum', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.enum('foo', ['bar', 'baz']);
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" varchar',
    );
  });

  it('test adding date', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', (table) => {
        table.date('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo" date');
  });

  it('test adding date time', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', (table) => {
        table.dateTime('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" datetime',
    );
  });

  it('test adding date time with options object', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', (table) => {
        table.dateTime('foo', { precision: 3 });
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" datetime(3)',
    );
  });

  it('test adding time', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', (table) => {
        table.time('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo" time');
  });

  it('test adding time stamp', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', (table) => {
        table.timestamp('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" timestamp',
    );
  });

  it('test adding time stamp with options object', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', (table) => {
        table.timestamp('foo', { precision: 3 });
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" timestamp(3)',
    );
  });

  it('test adding time stamps', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.timestamps();
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "created_at" datetime, add "updated_at" datetime',
    );
  });

  it('test adding precise timestamp', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.timestamp('foo', 6);
      });
    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" timestamp(6)',
    );
  });

  it('test adding precise datetime', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.datetime('foo', 6);
      });
    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" datetime(6)',
    );
  });

  it('test adding binary', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.binary('foo');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" add "foo" blob');
  });

  it('test adding decimal', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.decimal('foo', 2, 6);
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "foo" decimal(2, 6)',
    );
  });

  it('test set comment', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function(t) {
        t.comment('Custom comment');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" comment = \'Custom comment\'',
    );
  });

  it('test set empty comment', function() {
    tableSql = client
      .schemaBuilder()
      .table('users', function(t) {
        t.comment('');
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual('alter table "users" comment = \'\'');
  });

  it('should alter columns with the alter flag', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function() {
        // @ts-ignore
        this.string('foo').alter();
        // @ts-ignore
        this.string('bar');
      });

    equal(2, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add "bar" varchar(255)',
    );
    expect(tableSql.toSQL()[1].sql).toEqual(
      'alter table "users" modify "foo" varchar(255)',
    );
  });

  it('is possible to set raw statements in defaultTo, #146', () => {
    tableSql = client
      .schemaBuilder()
      .createTable('default_raw_test', function(t) {
        // @ts-ignore
        t.timestamp('created_at').defaultTo(client.raw('CURRENT_TIMESTAMP'));
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'create table "default_raw_test" ("created_at" timestamp default CURRENT_TIMESTAMP)',
    );
  });

  it('allows dropping a unique compound index', () => {
    tableSql = client
      .schemaBuilder()
      .table('composite_key_test', function(t) {
        t.dropUnique(['column_a', 'column_b']);
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "composite_key_test" drop index "composite_key_test_column_a_column_b_unique"',
    );
  });

  it('allows default as alias for defaultTo', () => {
    tableSql = client
      .schemaBuilder()
      .createTable('default_raw_test', function(t) {
        // @ts-ignore
        t.timestamp('created_at').default(client.raw('CURRENT_TIMESTAMP'));
      });

    equal(1, tableSql.toSQL().length);
    expect(tableSql.toSQL()[0].sql).toEqual(
      'create table "default_raw_test" ("created_at" timestamp default CURRENT_TIMESTAMP)',
    );
  });

  it('#1430 - .primary & .dropPrimary takes columns and constraintName', () => {
    tableSql = client
      .schemaBuilder()
      .table('users', function(t) {
        t.primary(['test1', 'test2'], 'testconstraintname');
      });
    expect(tableSql.toSQL()[0].sql).toEqual(
      'alter table "users" add primary key "testconstraintname"("test1", "test2")',
    );

    tableSql = client
      .schemaBuilder()
      .createTable('users', function(t) {
        t.string('test').primary('testconstraintname');
      });

    expect(tableSql.toSQL()[1].sql).toEqual(
      'alter table "users" add primary key "testconstraintname"("test")',
    );
  });

  describe('queryContext', () => {
    let spy;
    let originalWrapIdentifier;

    beforeAll(() => {
      spy = sinon.spy();
      // @ts-ignore
      originalWrapIdentifier = client.config.wrapIdentifier;
      // @ts-ignore
      client.config.wrapIdentifier = function(value, wrap, queryContext) {
        spy(value, queryContext);
        return wrap(value);
      };
    });

    beforeEach(() => {
      spy.resetHistory();
    });

    afterAll(() => {
      // @ts-ignore
      client.config.wrapIdentifier = originalWrapIdentifier;
    });

    it('SchemaCompiler passes queryContext to wrapIdentifier via TableCompiler', () => {
      client
        .schemaBuilder()
        .queryContext('schema context')
        .createTable('users', function(table) {
          table.increments('id');
          table.string('email');
        });

      expect(spy.callCount).toEqual(3);
      expect(spy.firstCall.args).toEqual(['id', 'schema context']);
      expect(spy.secondCall.args).toEqual(['email', 'schema context']);
      expect(spy.thirdCall.args).toEqual(['users', 'schema context']);
    });

    it('TableCompiler passes queryContext to wrapIdentifier', () => {
      client
        .schemaBuilder()
        .createTable('users', function(table) {
          table.increments('id').queryContext('id context');
          table.string('email').queryContext('email context');
        });

      expect(spy.callCount).toEqual(3);
      expect(spy.firstCall.args).toEqual(['id', 'id context']);
      expect(spy.secondCall.args).toEqual(['email', 'email context']);
      expect(spy.thirdCall.args).toEqual(['users', undefined]);
    });

    it('TableCompiler allows overwriting queryContext from SchemaCompiler', () => {
      client
        .schemaBuilder()
        .queryContext('schema context')
        .createTable('users', function(table) {
          table.queryContext('table context');
          table.increments('id');
          table.string('email');
        });

      expect(spy.callCount).toEqual(3);
      expect(spy.firstCall.args).toEqual(['id', 'table context']);
      expect(spy.secondCall.args).toEqual(['email', 'table context']);
      expect(spy.thirdCall.args).toEqual(['users', 'table context']);
    });

    it('ColumnCompiler allows overwriting queryContext from TableCompiler', () => {
      client
        .schemaBuilder()
        .queryContext('schema context')
        .createTable('users', function(table) {
          table.queryContext('table context');
          table.increments('id').queryContext('id context');
          table.string('email').queryContext('email context');
        });

      expect(spy.callCount).toEqual(3);
      expect(spy.firstCall.args).toEqual(['id', 'id context']);
      expect(spy.secondCall.args).toEqual(['email', 'email context']);
      expect(spy.thirdCall.args).toEqual(['users', 'table context']);
    });
  });
});
