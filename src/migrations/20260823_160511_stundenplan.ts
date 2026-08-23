/* eslint-disable @typescript-eslint/no-unused-vars -- generierte Migration, die Signatur ist vorgegeben */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_timetable_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_timetable\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_columns_order_idx\` ON \`pages_blocks_timetable_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_columns_parent_id_idx\` ON \`pages_blocks_timetable_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timetable_rows_cells\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`col_span\` numeric DEFAULT 1,
  	\`row_span\` numeric DEFAULT 1,
  	\`variant\` text DEFAULT 'lektion',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_timetable_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_rows_cells_order_idx\` ON \`pages_blocks_timetable_rows_cells\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_rows_cells_parent_id_idx\` ON \`pages_blocks_timetable_rows_cells\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timetable_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`time\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_timetable\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_rows_order_idx\` ON \`pages_blocks_timetable_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_rows_parent_id_idx\` ON \`pages_blocks_timetable_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timetable_legend\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`abbreviation\` text,
  	\`meaning\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_timetable\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_legend_order_idx\` ON \`pages_blocks_timetable_legend\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_legend_parent_id_idx\` ON \`pages_blocks_timetable_legend\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timetable\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_order_idx\` ON \`pages_blocks_timetable\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_parent_id_idx\` ON \`pages_blocks_timetable\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timetable_path_idx\` ON \`pages_blocks_timetable\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timetable_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_timetable\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_columns_order_idx\` ON \`_pages_v_blocks_timetable_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_columns_parent_id_idx\` ON \`_pages_v_blocks_timetable_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timetable_rows_cells\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`col_span\` numeric DEFAULT 1,
  	\`row_span\` numeric DEFAULT 1,
  	\`variant\` text DEFAULT 'lektion',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_timetable_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_rows_cells_order_idx\` ON \`_pages_v_blocks_timetable_rows_cells\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_rows_cells_parent_id_idx\` ON \`_pages_v_blocks_timetable_rows_cells\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timetable_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`time\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_timetable\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_rows_order_idx\` ON \`_pages_v_blocks_timetable_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_rows_parent_id_idx\` ON \`_pages_v_blocks_timetable_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timetable_legend\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`abbreviation\` text,
  	\`meaning\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_timetable\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_legend_order_idx\` ON \`_pages_v_blocks_timetable_legend\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_legend_parent_id_idx\` ON \`_pages_v_blocks_timetable_legend\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timetable\` (
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
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_order_idx\` ON \`_pages_v_blocks_timetable\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_parent_id_idx\` ON \`_pages_v_blocks_timetable\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timetable_path_idx\` ON \`_pages_v_blocks_timetable\` (\`_path\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_timetable_columns\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timetable_rows_cells\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timetable_rows\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timetable_legend\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timetable\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timetable_columns\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timetable_rows_cells\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timetable_rows\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timetable_legend\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timetable\`;`)
}
