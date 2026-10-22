CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'General',
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO tasks (title, category, done) VALUES
    ('Check service health', 'Operations', TRUE),
    ('Review reverse proxy route', 'Nginx', FALSE),
    ('Verify database persistence', 'PostgreSQL', FALSE);
