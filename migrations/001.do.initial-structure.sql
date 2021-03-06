CREATE TYPE member_type AS ENUM ('ketua', 'pengurus', 'anggota');

CREATE TABLE members (
  id UUID NOT NULL PRIMARY KEY,
  full_name varchar(255),
  city varchar(100),
  member_type member_type,
  birth_date timestamp with time zone NOT NULL,
  join_date timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT NULL,
  deleted_at timestamp with time zone NULL DEFAULT NULL
);