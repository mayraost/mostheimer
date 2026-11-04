import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "arch_pri" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "arch_lay" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"summary" varchar,
  	"stack" varchar,
  	"metric_label" varchar,
  	"metric_value" varchar
  );
  
  CREATE TABLE "pages_blocks_architecture_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_label" varchar DEFAULT 'Architektur',
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_arch_pri_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_arch_lay_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"summary" varchar,
  	"stack" varchar,
  	"metric_label" varchar,
  	"metric_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_architecture_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"section_label" varchar DEFAULT 'Architektur',
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "arch_pri" ADD CONSTRAINT "arch_pri_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arch_lay"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arch_lay" ADD CONSTRAINT "arch_lay_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_architecture_diagram"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_architecture_diagram" ADD CONSTRAINT "pages_blocks_architecture_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_arch_pri_v" ADD CONSTRAINT "_arch_pri_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_arch_lay_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_arch_lay_v" ADD CONSTRAINT "_arch_lay_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_architecture_diagram"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_architecture_diagram" ADD CONSTRAINT "_pages_v_blocks_architecture_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "arch_pri_order_idx" ON "arch_pri" USING btree ("_order");
  CREATE INDEX "arch_pri_parent_id_idx" ON "arch_pri" USING btree ("_parent_id");
  CREATE INDEX "arch_pri_locale_idx" ON "arch_pri" USING btree ("_locale");
  CREATE INDEX "arch_lay_order_idx" ON "arch_lay" USING btree ("_order");
  CREATE INDEX "arch_lay_parent_id_idx" ON "arch_lay" USING btree ("_parent_id");
  CREATE INDEX "arch_lay_locale_idx" ON "arch_lay" USING btree ("_locale");
  CREATE INDEX "pages_blocks_architecture_diagram_order_idx" ON "pages_blocks_architecture_diagram" USING btree ("_order");
  CREATE INDEX "pages_blocks_architecture_diagram_parent_id_idx" ON "pages_blocks_architecture_diagram" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_architecture_diagram_path_idx" ON "pages_blocks_architecture_diagram" USING btree ("_path");
  CREATE INDEX "pages_blocks_architecture_diagram_locale_idx" ON "pages_blocks_architecture_diagram" USING btree ("_locale");
  CREATE INDEX "_arch_pri_v_order_idx" ON "_arch_pri_v" USING btree ("_order");
  CREATE INDEX "_arch_pri_v_parent_id_idx" ON "_arch_pri_v" USING btree ("_parent_id");
  CREATE INDEX "_arch_pri_v_locale_idx" ON "_arch_pri_v" USING btree ("_locale");
  CREATE INDEX "_arch_lay_v_order_idx" ON "_arch_lay_v" USING btree ("_order");
  CREATE INDEX "_arch_lay_v_parent_id_idx" ON "_arch_lay_v" USING btree ("_parent_id");
  CREATE INDEX "_arch_lay_v_locale_idx" ON "_arch_lay_v" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_architecture_diagram_order_idx" ON "_pages_v_blocks_architecture_diagram" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_architecture_diagram_parent_id_idx" ON "_pages_v_blocks_architecture_diagram" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_architecture_diagram_path_idx" ON "_pages_v_blocks_architecture_diagram" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_architecture_diagram_locale_idx" ON "_pages_v_blocks_architecture_diagram" USING btree ("_locale");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "arch_pri" CASCADE;
  DROP TABLE "arch_lay" CASCADE;
  DROP TABLE "pages_blocks_architecture_diagram" CASCADE;
  DROP TABLE "_arch_pri_v" CASCADE;
  DROP TABLE "_arch_lay_v" CASCADE;
  DROP TABLE "_pages_v_blocks_architecture_diagram" CASCADE;`);
}
