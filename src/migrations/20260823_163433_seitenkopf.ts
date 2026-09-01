/* eslint-disable @typescript-eslint/no-unused-vars -- generierte Migration, die Signatur ist vorgegeben */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_page_header\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`lead\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_page_header_order_idx\` ON \`pages_blocks_page_header\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_page_header_parent_id_idx\` ON \`pages_blocks_page_header\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_page_header_path_idx\` ON \`pages_blocks_page_header\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_page_header\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	\`lead\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_page_header_order_idx\` ON \`_pages_v_blocks_page_header\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_page_header_parent_id_idx\` ON \`_pages_v_blocks_page_header\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_page_header_path_idx\` ON \`_pages_v_blocks_page_header\` (\`_path\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_page_header\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_page_header\`;`)
}
