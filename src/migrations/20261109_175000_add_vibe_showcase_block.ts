import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_vibe_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"empty_state" varchar,
  	"page_size" numeric DEFAULT 6,
  	"show_filter" boolean DEFAULT true,
  	"feature_first" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_vibe_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"empty_state" varchar,
  	"page_size" numeric DEFAULT 6,
  	"show_filter" boolean DEFAULT true,
  	"feature_first" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_vibe_showcase" ADD CONSTRAINT "pages_blocks_vibe_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_vibe_showcase" ADD CONSTRAINT "_pages_v_blocks_vibe_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_vibe_showcase_order_idx" ON "pages_blocks_vibe_showcase" USING btree ("_order");
  CREATE INDEX "pages_blocks_vibe_showcase_parent_id_idx" ON "pages_blocks_vibe_showcase" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_vibe_showcase_path_idx" ON "pages_blocks_vibe_showcase" USING btree ("_path");
  CREATE INDEX "pages_blocks_vibe_showcase_locale_idx" ON "pages_blocks_vibe_showcase" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_vibe_showcase_order_idx" ON "_pages_v_blocks_vibe_showcase" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_vibe_showcase_parent_id_idx" ON "_pages_v_blocks_vibe_showcase" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_vibe_showcase_path_idx" ON "_pages_v_blocks_vibe_showcase" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_vibe_showcase_locale_idx" ON "_pages_v_blocks_vibe_showcase" USING btree ("_locale");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_vibe_showcase" CASCADE;
  DROP TABLE "_pages_v_blocks_vibe_showcase" CASCADE;`);
}
