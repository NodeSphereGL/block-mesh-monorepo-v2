CREATE TABLE usages
(
    id          uuid PRIMARY KEY,
    user_id     uuid        NOT NULL UNIQUE,
    usage_limit BIGINT      NOT NULL,
    usage       BIGINT      NOT NULL,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX usage_created_at ON usages (created_at);
CREATE INDEX usage_updated_at ON usages (updated_at);
CREATE INDEX usage_user_id ON usages (user_id);
CREATE INDEX usage_limit ON usages (usage_limit);
CREATE INDEX usage_usage ON usages (usage);
