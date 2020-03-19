import * as Bluebird from "bluebird";
import * as Client from "knex/lib/client";
import { SnowflakeTransaction } from "./Transaction";
import { QueryCompiler } from "./query/QueryCompiler";
import { ColumnCompiler, SchemaCompiler, TableCompiler } from "./schema";
import { SnowflakeColumnBuilder } from "./schema/ColumnBuilder";
export declare class SnowflakeDialect extends Client {
    constructor(config?: any);
    // @ts-ignore
    get dialect(): string;
    // @ts-ignore
    get driverName(): string;
    transaction(): SnowflakeTransaction;
    queryCompiler(builder: any): QueryCompiler;
    columnBuilder(): SnowflakeColumnBuilder;
    columnCompiler(builder: any): ColumnCompiler;
    tableCompiler(builder: any): TableCompiler;
    schemaCompiler(builder: any): SchemaCompiler;
    _driver(): any;
    acquireRawConnection(): Bluebird<unknown>;
    destroyRawConnection(connection: any): Promise<unknown>;
    validateConnection(connection: any): boolean;
    _query(connection: any, obj: any): Bluebird<unknown>;
    processResponse(obj: any, runner: any): any;
}
