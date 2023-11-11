CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    did TEXT NOT NULL UNIQUE
);

CREATE TABLE credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    credential_id VARCHAR(255) NOT NULL UNIQUE,
    data JSONB NOT NULL
);

CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    did TEXT NOT NULL UNIQUE,
    challenge VARCHAR(255) NOT NULL UNIQUE,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
    expires_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW() + INTERVAL '10 minutes')
);