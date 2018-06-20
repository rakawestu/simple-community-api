import env from 'good-env'

const config = {
  serverPort: env.getNumber('SERVER_PORT', 8080),

  // Postgres configuration
  pgHost: env.get('PG_HOST', 'localhost'),
  pgPort: env.getNumber('PG_PORT', 5432),
  pgDatabase: env.get('PG_DATABASE', 'community_db'),
  pgUser: env.get('PG_USER', 'community_user'),
  pgPassword: env.get('PG_PASSWORD', 'community_password')
}

export default config