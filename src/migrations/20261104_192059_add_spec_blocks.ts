import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_tech_radar_quadrants_items_tier" AS ENUM('core', 'proven', 'focus');
  CREATE TYPE "public"."enum__pages_v_blocks_tech_radar_quadrants_items_tier" AS ENUM('core', 'proven', 'focus');
  CREATE TABLE "pages_blocks_case_study" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"client" varchar,
  	"period" varchar,
  	"context" varchar,
  	"solution" varchar,
  	"contribution" varchar,
  	"role" varchar,
  	"link" varchar,
  	"link_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_tech_radar_quadrants_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tier" "enum_pages_blocks_tech_radar_quadrants_items_tier",
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_tech_radar_quadrants" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "pages_blocks_tech_radar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonial_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"company" varchar,
  	"role" varchar,
  	"highlights" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_pages_v_blocks_case_study" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"client" varchar,
  	"period" varchar,
  	"context" varchar,
  	"solution" varchar,
  	"contribution" varchar,
  	"role" varchar,
  	"link" varchar,
  	"link_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tech_radar_quadrants_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tier" "enum__pages_v_blocks_tech_radar_quadrants_items_tier",
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tech_radar_quadrants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tech_radar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"company" varchar,
  	"role" varchar,
  	"highlights" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  ALTER TABLE "pages_blocks_case_study" ADD CONSTRAINT "pages_blocks_case_study_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tech_radar_quadrants_items" ADD CONSTRAINT "pages_blocks_tech_radar_quadrants_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tech_radar_quadrants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tech_radar_quadrants" ADD CONSTRAINT "pages_blocks_tech_radar_quadrants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tech_radar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tech_radar" ADD CONSTRAINT "pages_blocks_tech_radar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_items" ADD CONSTRAINT "pages_blocks_testimonial_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonial"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial" ADD CONSTRAINT "pages_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_entries" ADD CONSTRAINT "pages_blocks_timeline_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_case_study" ADD CONSTRAINT "_pages_v_blocks_case_study_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tech_radar_quadrants_items" ADD CONSTRAINT "_pages_v_blocks_tech_radar_quadrants_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tech_radar_quadrants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tech_radar_quadrants" ADD CONSTRAINT "_pages_v_blocks_tech_radar_quadrants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tech_radar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tech_radar" ADD CONSTRAINT "_pages_v_blocks_tech_radar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_items" ADD CONSTRAINT "_pages_v_blocks_testimonial_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonial"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial" ADD CONSTRAINT "_pages_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_entries" ADD CONSTRAINT "_pages_v_blocks_timeline_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_case_study_order_idx" ON "pages_blocks_case_study" USING btree ("_order");
  CREATE INDEX "pages_blocks_case_study_parent_id_idx" ON "pages_blocks_case_study" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_case_study_path_idx" ON "pages_blocks_case_study" USING btree ("_path");
  CREATE INDEX "pages_blocks_case_study_locale_idx" ON "pages_blocks_case_study" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tech_radar_quadrants_items_order_idx" ON "pages_blocks_tech_radar_quadrants_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_tech_radar_quadrants_items_parent_id_idx" ON "pages_blocks_tech_radar_quadrants_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tech_radar_quadrants_items_locale_idx" ON "pages_blocks_tech_radar_quadrants_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tech_radar_quadrants_order_idx" ON "pages_blocks_tech_radar_quadrants" USING btree ("_order");
  CREATE INDEX "pages_blocks_tech_radar_quadrants_parent_id_idx" ON "pages_blocks_tech_radar_quadrants" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tech_radar_quadrants_locale_idx" ON "pages_blocks_tech_radar_quadrants" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tech_radar_order_idx" ON "pages_blocks_tech_radar" USING btree ("_order");
  CREATE INDEX "pages_blocks_tech_radar_parent_id_idx" ON "pages_blocks_tech_radar" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tech_radar_path_idx" ON "pages_blocks_tech_radar" USING btree ("_path");
  CREATE INDEX "pages_blocks_tech_radar_locale_idx" ON "pages_blocks_tech_radar" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonial_items_order_idx" ON "pages_blocks_testimonial_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_items_parent_id_idx" ON "pages_blocks_testimonial_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_items_locale_idx" ON "pages_blocks_testimonial_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonial_order_idx" ON "pages_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_parent_id_idx" ON "pages_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_path_idx" ON "pages_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonial_locale_idx" ON "pages_blocks_testimonial" USING btree ("_locale");
  CREATE INDEX "pages_blocks_timeline_entries_order_idx" ON "pages_blocks_timeline_entries" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_entries_parent_id_idx" ON "pages_blocks_timeline_entries" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_entries_locale_idx" ON "pages_blocks_timeline_entries" USING btree ("_locale");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "pages_blocks_timeline_locale_idx" ON "pages_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "pages_texts_order_parent" ON "pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "pages_texts_locale_parent" ON "pages_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_pages_v_blocks_case_study_order_idx" ON "_pages_v_blocks_case_study" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_case_study_parent_id_idx" ON "_pages_v_blocks_case_study" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_case_study_path_idx" ON "_pages_v_blocks_case_study" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_case_study_locale_idx" ON "_pages_v_blocks_case_study" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tech_radar_quadrants_items_order_idx" ON "_pages_v_blocks_tech_radar_quadrants_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tech_radar_quadrants_items_parent_id_idx" ON "_pages_v_blocks_tech_radar_quadrants_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tech_radar_quadrants_items_locale_idx" ON "_pages_v_blocks_tech_radar_quadrants_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tech_radar_quadrants_order_idx" ON "_pages_v_blocks_tech_radar_quadrants" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tech_radar_quadrants_parent_id_idx" ON "_pages_v_blocks_tech_radar_quadrants" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tech_radar_quadrants_locale_idx" ON "_pages_v_blocks_tech_radar_quadrants" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tech_radar_order_idx" ON "_pages_v_blocks_tech_radar" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tech_radar_parent_id_idx" ON "_pages_v_blocks_tech_radar" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tech_radar_path_idx" ON "_pages_v_blocks_tech_radar" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_tech_radar_locale_idx" ON "_pages_v_blocks_tech_radar" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonial_items_order_idx" ON "_pages_v_blocks_testimonial_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_items_parent_id_idx" ON "_pages_v_blocks_testimonial_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_items_locale_idx" ON "_pages_v_blocks_testimonial_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonial_order_idx" ON "_pages_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_parent_id_idx" ON "_pages_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_path_idx" ON "_pages_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_locale_idx" ON "_pages_v_blocks_testimonial" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_timeline_entries_order_idx" ON "_pages_v_blocks_timeline_entries" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_entries_parent_id_idx" ON "_pages_v_blocks_timeline_entries" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_entries_locale_idx" ON "_pages_v_blocks_timeline_entries" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_timeline_locale_idx" ON "_pages_v_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_pages_v_texts_locale_parent" ON "_pages_v_texts" USING btree ("locale","parent_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_case_study" CASCADE;
  DROP TABLE "pages_blocks_tech_radar_quadrants_items" CASCADE;
  DROP TABLE "pages_blocks_tech_radar_quadrants" CASCADE;
  DROP TABLE "pages_blocks_tech_radar" CASCADE;
  DROP TABLE "pages_blocks_testimonial_items" CASCADE;
  DROP TABLE "pages_blocks_testimonial" CASCADE;
  DROP TABLE "pages_blocks_timeline_entries" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "pages_texts" CASCADE;
  DROP TABLE "_pages_v_blocks_case_study" CASCADE;
  DROP TABLE "_pages_v_blocks_tech_radar_quadrants_items" CASCADE;
  DROP TABLE "_pages_v_blocks_tech_radar_quadrants" CASCADE;
  DROP TABLE "_pages_v_blocks_tech_radar" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_items" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_entries" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_pages_v_texts" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_tech_radar_quadrants_items_tier";
  DROP TYPE "public"."enum__pages_v_blocks_tech_radar_quadrants_items_tier";`);
}
