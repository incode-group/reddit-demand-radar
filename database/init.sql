-- Database initialization script for Reddit Demand Radar
-- This script sets up the initial database structure and permissions

-- Create database (if not exists - handled by docker-entrypoint-initdb.d)
-- The database is created by the POSTGRES_DB environment variable

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set up proper permissions for the application user
GRANT ALL PRIVILEGES ON DATABASE reddit_radar TO reddit_user;

-- Grant necessary permissions on schemas
GRANT CREATE ON DATABASE reddit_radar TO reddit_user;
GRANT USAGE ON SCHEMA public TO reddit_user;
GRANT CREATE ON SCHEMA public TO reddit_user;

-- Grant permissions on all future tables in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO reddit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO reddit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO reddit_user;

-- Optimize PostgreSQL for the application
-- These settings can be overridden in postgresql.conf if needed

-- Connection settings
ALTER SYSTEM SET max_connections = 100;

-- Memory settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- WAL settings
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_writer_delay = 200ms;
ALTER SYSTEM SET checkpoint_timeout = 15min;

-- Performance settings
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Logging settings
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Vacuum settings
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_max_workers = 3;
ALTER SYSTEM SET autovacuum_naptime = 1min;
ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;
ALTER SYSTEM SET autovacuum_analyze_threshold = 50;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.2;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.1;

-- Connection logging
SELECT pg_reload_conf();

-- Create a simple health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS TEXT AS $$
BEGIN
    RETURN 'OK';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on health check function
GRANT EXECUTE ON FUNCTION health_check() TO reddit_user;

-- Create indexes for better performance (these will be created by Prisma migrations,
-- but we create basic ones here for immediate use)
-- Note: Prisma will manage the actual schema, this is just for initial setup

-- Log database initialization
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING;

-- Vacuum the database to update statistics
VACUUM ANALYZE;