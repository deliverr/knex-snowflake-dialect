// @ts-ignore
import * as SchemaCompiler_MySQL from "knex/lib/dialects/mysql/schema/compiler";

export class SchemaCompiler extends SchemaCompiler_MySQL {
  constructor(client: any, builder: any) {
    super(client, builder);
  }
}
