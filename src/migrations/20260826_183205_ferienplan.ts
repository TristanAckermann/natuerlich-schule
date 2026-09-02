/* eslint-disable @typescript-eslint/no-unused-vars -- generierte Migration, die Signatur ist vorgegeben */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_holiday_plan_years_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`from\` text,
  	\`to\` text,
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_holiday_plan_years\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_holiday_plan_years_entries_order_idx\` ON \`pages_blocks_holiday_plan_years_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_holiday_plan_years_entries_parent_id_idx\` ON \`pages_blocks_holiday_plan_years_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_holiday_plan_years\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_holiday_plan\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_holiday_plan_years_order_idx\` ON \`pages_blocks_holiday_plan_years\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_holiday_plan_years_parent_id_idx\` ON \`pages_blocks_holiday_plan_years\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_holiday_plan\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_holiday_plan_order_idx\` ON \`pages_blocks_holiday_plan\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_holiday_plan_parent_id_idx\` ON \`pages_blocks_holiday_plan\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_holiday_plan_path_idx\` ON \`pages_blocks_holiday_plan\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_holiday_plan_years_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`from\` text,
  	\`to\` text,
  	\`note\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_holiday_plan_years\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_holiday_plan_years_entries_order_idx\` ON \`_pages_v_blocks_holiday_plan_years_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_holiday_plan_years_entries_parent_id_idx\` ON \`_pages_v_blocks_holiday_plan_years_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_holiday_plan_years\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_holiday_plan\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_holiday_plan_years_order_idx\` ON \`_pages_v_blocks_holiday_plan_years\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_holiday_plan_years_parent_id_idx\` ON \`_pages_v_blocks_holiday_plan_years\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_holiday_plan\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_holiday_plan_order_idx\` ON \`_pages_v_blocks_holiday_plan\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_holiday_plan_parent_id_idx\` ON \`_pages_v_blocks_holiday_plan\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_holiday_plan_path_idx\` ON \`_pages_v_blocks_holiday_plan\` (\`_path\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_holiday_plan_years_entries\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_holiday_plan_years\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_holiday_plan\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_holiday_plan_years_entries\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_holiday_plan_years\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_holiday_plan\`;`)
}
