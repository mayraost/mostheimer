export const envConfig = {
  payloadSecret: process.env.PAYLOAD_SECRET || 'ABC',
  dbUrl: process.env.DATABASE_URL || 'file:./payload.db',
  dbType: process.env.DATABASE_TYPE || 'sqllite',
};
