import type { Connection, Binds } from 'snowflake-sdk';

let connection: Connection | null = null;

function getConnection(): Promise<Connection> {
  return new Promise((resolve, reject) => {
    if (connection) return resolve(connection);

    const rawKey = process.env.SNOWFLAKE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!rawKey) return reject(new Error('SNOWFLAKE_PRIVATE_KEY is not set'));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const snowflake = require('snowflake-sdk') as typeof import('snowflake-sdk');

    const conn = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT ?? 'ik70694.uk-south.azure',
      username: process.env.SNOWFLAKE_USER ?? 'FEEDBACK_SVC',
      authenticator: 'SNOWFLAKE_JWT',
      privateKey: rawKey,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE ?? 'COMPUTE_WH',
      database: process.env.SNOWFLAKE_DATABASE ?? 'APP_BACKEND_PROD',
      schema: process.env.SNOWFLAKE_SCHEMA ?? 'COLLECTION',
    });

    conn.connect((err, c) => {
      if (err) return reject(err);
      connection = c;
      resolve(c);
    });
  });
}

export async function snowflakeQuery<T = Record<string, unknown>>(
  sql: string,
  binds: unknown[] = []
): Promise<T[]> {
  const conn = await getConnection();
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: sql,
      binds: binds as Binds,
      complete: (err, _stmt, rows) => {
        if (err) return reject(err);
        // Normalise keys to lowercase to match REST API behaviour
        const result = (rows ?? []).map(row => {
          const lower: Record<string, unknown> = {};
          for (const k of Object.keys(row as object)) {
            lower[k.toLowerCase()] = (row as Record<string, unknown>)[k];
          }
          return lower;
        });
        resolve(result as T[]);
      },
    });
  });
}
