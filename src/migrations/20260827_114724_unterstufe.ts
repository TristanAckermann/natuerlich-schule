/* eslint-disable @typescript-eslint/no-unused-vars -- generierte Migration, die Signatur ist vorgegeben */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/*
 * `ON DELETE set null` ist von Hand ergänzt: `ALTER TABLE … ADD` lässt die Klausel
 * beim Generieren fallen, obwohl der Snapshot sie deklariert. Ohne sie liesse sich
 * ein Bild nicht mehr löschen, sobald ein Seitenkopf darauf zeigt — alle übrigen
 * Medien-Fremdschlüssel im Schema stehen auf `set null`.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_page_header\` ADD \`icon_id\` integer REFERENCES media(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_page_header_icon_idx\` ON \`pages_blocks_page_header\` (\`icon_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_page_header\` ADD \`icon_id\` integer REFERENCES media(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_page_header_icon_idx\` ON \`_pages_v_blocks_page_header\` (\`icon_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_page_header\` (
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
  await db.run(sql`INSERT INTO \`__new_pages_blocks_page_header\`("_order", "_parent_id", "_path", "id", "heading", "lead", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "lead", "block_name" FROM \`pages_blocks_page_header\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_page_header\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_page_header\` RENAME TO \`pages_blocks_page_header\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_page_header_order_idx\` ON \`pages_blocks_page_header\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_page_header_parent_id_idx\` ON \`pages_blocks_page_header\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_page_header_path_idx\` ON \`pages_blocks_page_header\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_page_header\` (
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
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_page_header\`("_order", "_parent_id", "_path", "id", "heading", "lead", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "heading", "lead", "_uuid", "block_name" FROM \`_pages_v_blocks_page_header\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_page_header\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_page_header\` RENAME TO \`_pages_v_blocks_page_header\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_page_header_order_idx\` ON \`_pages_v_blocks_page_header\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_page_header_parent_id_idx\` ON \`_pages_v_blocks_page_header\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_page_header_path_idx\` ON \`_pages_v_blocks_page_header\` (\`_path\`);`)
}
