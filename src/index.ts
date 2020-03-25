import * as Bluebird from "bluebird";
import * as Knex from "knex";
import { defer, map } from "lodash";

import { QueryCompiler } from "./query/QueryCompiler";
import { SchemaCompiler, TableCompiler } from "./schema";
import * as ColumnBuilder from "knex/lib/schema/columnbuilder";
import * as Transaction from "knex/lib/transaction";
import { promisify } from "util";

export class SnowflakeDialect extends Knex.Client {
  constructor(config = {} as any) {
    if (config.connection) {
      if (config.connection.user && !config.connection.username) {
        config.connection.username = config.connection.user;
      }
      if (config.connection.host) {
        const [account, region] = config.connection.host.split('.');
        if (!config.connection.account) {
          config.connection.account = account;
        }
        if (!config.connection.region) {
          config.connection.region = region;
        }
      }
    }
    super(config);
  }

  public get dialect() {
    return "snowflake";
  }

  public get driverName() {
    return "snowflake-sdk";
  }

  transaction(): Knex.Transaction {
    const transax = new Transaction();
    transax.savepoint = (conn: any) => {
      // @ts-ignore
      transax.trxClient.logger('Snowflake does not support savepoints.');
    };

    transax.release = (conn: any, value: any) => {
      // @ts-ignore
      transax.trxClient.logger('Snowflake does not support savepoints.');
    };

    transax.rollbackTo = (conn: any, error: any) => {
      // @ts-ignore
      this.trxClient.logger('Snowflake does not support savepoints.');
    };
    return transax;
  }

  queryCompiler(builder: any) {
    return new QueryCompiler(this, builder);
  }

  columnBuilder(tableBuilder: any, type: any, args: any) {
    // ColumnBuilder methods are created at runtime, so that it does not play well with TypeScript.
    // So instead of extending ColumnBuilder, we override methods at runtime here
    const columnBuilder = new ColumnBuilder(this, tableBuilder, type, args);
    columnBuilder.primary = (constraintName?: string | undefined): Knex.ColumnBuilder => {
      // @ts-ignore
      columnBuilder.notNullable();
      return columnBuilder;
    };
    columnBuilder.index = (indexName?: string | undefined): Knex.ColumnBuilder => {
      // @ts-ignore
      columnBuilder.client.logger.warn(
        'Snowflake does not support the creation of indexes.'
      );
      return columnBuilder;
    };

    return columnBuilder;
  }

  /*columnCompiler(tableCompiler: any, columnBuilder: any) {
    return new ColumnCompiler_MySQL(this, tableCompiler.tableBuilder, columnBuilder);
  }*/

  tableCompiler(tableBuilder: any) {
    return new TableCompiler(this, tableBuilder);
  }

  schemaCompiler(builder: any) {
    return new SchemaCompiler(this, builder);
  }

  _driver() {
    const Snowflake = require("snowflake-sdk");
    return Snowflake;
  }

  // Get a raw connection, called by the `pool` whenever a new
  // connection needs to be added to the pool.
  acquireRawConnection() {
    return new Bluebird((resolver, rejecter) => {
      // @ts-ignore
      const connection = this.driver.createConnection(this.connectionSettings);
      connection.on('error', (err) => {
        connection.__knex__disposed = err;
      });
      connection.connect((err) => {
        if (err) {
          // if connection is rejected, remove listener that was registered above...
          connection.removeAllListeners();
          return rejecter(err);
        }
        resolver(connection);
      });
    });
  }

  // Used to explicitly close a connection, called internally by the pool
  // when a connection times out or the pool is shutdown.
  async destroyRawConnection(connection): Promise<void> {
    try {
      const end = promisify((cb) => connection.end(cb));
      await end();
    } catch (err) {
      connection.__knex__disposed = err;
    } finally {
      // see discussion https://github.com/knex/knex/pull/3483
      defer(() => connection.removeAllListeners());
    }
  }

  async validateConnection(connection: any): Promise<boolean> {
    if (connection) {
      return true;
    }
    return false;
  }

  // Runs the query on the specified connection, providing the bindings
  // and any other necessary prep work.
  _query(connection: any, obj: any) {
    if (!obj || typeof obj === 'string') obj = { sql: obj };
    return new Bluebird((resolver: any, rejecter: any) => {
      if (!obj.sql) {
        resolver();
        return;
      }

      const queryOptions =
          {
            sqlText: obj.sql,
            binds: obj.bindings,
            complete(err: any, statement: any, rows: any) {
              if (err) return rejecter(err);
              obj.response = {rows, statement};
              resolver(obj);
            },
            ...obj.options
          };
      connection.execute(queryOptions);
    });
  }

  // Ensures the response is returned in the same format as other clients.
  processResponse(obj: any, runner: any) {
    const resp = obj.response;
    if (obj.output) return obj.output.call(runner, resp);
    if (obj.method === 'raw') return resp;
    if (resp.command === 'SELECT' || (resp.statement && resp.rows)) {
      if (obj.method === 'first') return resp.rows[0];
      if (obj.method === 'pluck') return map(resp.rows, obj.pluck);
      return resp.rows;
    }
    if (
      resp.command === 'INSERT' ||
      resp.command === 'UPDATE' ||
      resp.command === 'DELETE'
    ) {
      return resp.rowCount;
    }
    return resp;
  }

}
