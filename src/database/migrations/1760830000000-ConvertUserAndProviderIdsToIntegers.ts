import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertUserAndProviderIdsToIntegers1760830000000
  implements MigrationInterface
{
  name = 'ConvertUserAndProviderIdsToIntegers1760830000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        IF to_regclass('public.users') IS NULL THEN
          RETURN;
        END IF;

        IF to_regclass('public.providers') IS NULL THEN
          RAISE EXCEPTION 'Cannot migrate user IDs because the providers table is missing';
        END IF;

        CREATE TEMP TABLE _user_id_map ON COMMIT DROP AS
          SELECT id AS old_id, row_number() OVER (ORDER BY id)::integer AS new_id
          FROM users;
        CREATE TEMP TABLE _provider_id_map ON COMMIT DROP AS
          SELECT id AS old_id, row_number() OVER (ORDER BY id)::integer AS new_id
          FROM providers;

        FOR constraint_name IN
          SELECT conname
          FROM pg_constraint
          WHERE conrelid = 'public.providers'::regclass
            AND confrelid = 'public.users'::regclass
            AND contype = 'f'
        LOOP
          EXECUTE format('ALTER TABLE providers DROP CONSTRAINT %I', constraint_name);
        END LOOP;

        ALTER TABLE users ADD COLUMN id_numeric integer;
        ALTER TABLE providers
          ADD COLUMN id_numeric integer,
          ADD COLUMN user_id_numeric integer;

        UPDATE users u SET id_numeric = m.new_id
          FROM _user_id_map m WHERE u.id = m.old_id;
        UPDATE providers p SET id_numeric = m.new_id
          FROM _provider_id_map m WHERE p.id = m.old_id;
        UPDATE providers p SET user_id_numeric = m.new_id
          FROM _user_id_map m WHERE p."userId" = m.old_id;

        IF EXISTS (
          SELECT 1 FROM providers
          WHERE id_numeric IS NULL OR user_id_numeric IS NULL
        ) THEN
          RAISE EXCEPTION 'Cannot migrate providers with missing user references';
        END IF;

        IF to_regclass('public.conversations') IS NOT NULL THEN
          ALTER TABLE conversations
            ADD COLUMN resident_id_numeric integer,
            ADD COLUMN provider_id_numeric integer,
            ADD COLUMN provider_user_id_numeric integer;
          UPDATE conversations c SET resident_id_numeric = m.new_id
            FROM _user_id_map m WHERE c."residentId" = m.old_id;
          UPDATE conversations c SET provider_user_id_numeric = m.new_id
            FROM _user_id_map m WHERE c."providerUserId" = m.old_id;
          UPDATE conversations c SET provider_id_numeric = m.new_id
            FROM _provider_id_map m WHERE c."providerId" = m.old_id;
          IF EXISTS (
            SELECT 1 FROM conversations
            WHERE resident_id_numeric IS NULL
              OR provider_user_id_numeric IS NULL
              OR provider_id_numeric IS NULL
          ) THEN
            RAISE EXCEPTION 'Cannot migrate conversations with missing user or provider references';
          END IF;
          ALTER TABLE conversations
            DROP COLUMN "residentId" CASCADE,
            DROP COLUMN "providerId" CASCADE,
            DROP COLUMN "providerUserId" CASCADE;
          ALTER TABLE conversations
            RENAME COLUMN resident_id_numeric TO "residentId";
          ALTER TABLE conversations
            RENAME COLUMN provider_id_numeric TO "providerId";
          ALTER TABLE conversations
            RENAME COLUMN provider_user_id_numeric TO "providerUserId";
        END IF;

        IF to_regclass('public.messages') IS NOT NULL THEN
          ALTER TABLE messages ADD COLUMN sender_id_numeric integer;
          UPDATE messages m SET sender_id_numeric = u.new_id
            FROM _user_id_map u WHERE m."senderId" = u.old_id;
          IF EXISTS (SELECT 1 FROM messages WHERE sender_id_numeric IS NULL) THEN
            RAISE EXCEPTION 'Cannot migrate messages with missing sender users';
          END IF;
          ALTER TABLE messages DROP COLUMN "senderId" CASCADE;
          ALTER TABLE messages RENAME COLUMN sender_id_numeric TO "senderId";
        END IF;

        IF to_regclass('public.blocks') IS NOT NULL THEN
          ALTER TABLE blocks
            ADD COLUMN blocker_id_numeric integer,
            ADD COLUMN blocked_id_numeric integer;
          UPDATE blocks b SET blocker_id_numeric = u.new_id
            FROM _user_id_map u WHERE b."blockerId" = u.old_id;
          UPDATE blocks b SET blocked_id_numeric = u.new_id
            FROM _user_id_map u WHERE b."blockedId" = u.old_id;
          IF EXISTS (
            SELECT 1 FROM blocks
            WHERE blocker_id_numeric IS NULL OR blocked_id_numeric IS NULL
          ) THEN
            RAISE EXCEPTION 'Cannot migrate blocks with missing user references';
          END IF;
          ALTER TABLE blocks
            DROP COLUMN "blockerId" CASCADE,
            DROP COLUMN "blockedId" CASCADE;
          ALTER TABLE blocks RENAME COLUMN blocker_id_numeric TO "blockerId";
          ALTER TABLE blocks RENAME COLUMN blocked_id_numeric TO "blockedId";
        END IF;

        IF to_regclass('public.reports') IS NOT NULL THEN
          ALTER TABLE reports
            ADD COLUMN reporter_id_numeric integer,
            ADD COLUMN reported_user_id_numeric integer;
          UPDATE reports r SET reporter_id_numeric = u.new_id
            FROM _user_id_map u WHERE r."reporterId" = u.old_id;
          UPDATE reports r SET reported_user_id_numeric = u.new_id
            FROM _user_id_map u WHERE r."reportedUserId" = u.old_id;
          IF EXISTS (
            SELECT 1 FROM reports
            WHERE reporter_id_numeric IS NULL OR reported_user_id_numeric IS NULL
          ) THEN
            RAISE EXCEPTION 'Cannot migrate reports with missing user references';
          END IF;
          ALTER TABLE reports
            DROP COLUMN "reporterId" CASCADE,
            DROP COLUMN "reportedUserId" CASCADE;
          ALTER TABLE reports RENAME COLUMN reporter_id_numeric TO "reporterId";
          ALTER TABLE reports RENAME COLUMN reported_user_id_numeric TO "reportedUserId";
        END IF;

        ALTER TABLE users DROP COLUMN id CASCADE;
        ALTER TABLE users RENAME COLUMN id_numeric TO id;
        ALTER TABLE users ALTER COLUMN id SET NOT NULL;
        ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
        CREATE SEQUENCE users_id_seq OWNED BY users.id;
        ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
        PERFORM setval(
          'users_id_seq',
          COALESCE((SELECT MAX(id) FROM users), 0) + 1,
          false
        );

        ALTER TABLE providers
          DROP COLUMN id CASCADE,
          DROP COLUMN "userId" CASCADE;
        ALTER TABLE providers RENAME COLUMN id_numeric TO id;
        ALTER TABLE providers RENAME COLUMN user_id_numeric TO "userId";
        ALTER TABLE providers ALTER COLUMN id SET NOT NULL;
        ALTER TABLE providers ALTER COLUMN "userId" SET NOT NULL;
        ALTER TABLE providers ADD CONSTRAINT providers_pkey PRIMARY KEY (id);
        CREATE SEQUENCE providers_id_seq OWNED BY providers.id;
        ALTER TABLE providers ALTER COLUMN id SET DEFAULT nextval('providers_id_seq');
        PERFORM setval(
          'providers_id_seq',
          COALESCE((SELECT MAX(id) FROM providers), 0) + 1,
          false
        );
      END $$;
    `);
  }

  async down(): Promise<void> {
    throw new Error(
      'UUID values cannot be reconstructed after migrating user and provider IDs to integers',
    );
  }
}
