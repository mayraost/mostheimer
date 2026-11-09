import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_vibe_projects_kind" AS ENUM('experiment', 'tool', 'product');
  CREATE TYPE "public"."enum_vibe_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__vibe_projects_v_version_kind" AS ENUM('experiment', 'tool', 'product');
  CREATE TYPE "public"."enum__vibe_projects_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum__vibe_projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "vibe_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vibe_tags_locales" (
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "vibe_tags_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "_vibe_tags_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_vibe_tags_v_locales" (
  	"version_label" varchar NOT NULL,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_vibe_tags_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "vibe_projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"kind" "enum_vibe_projects_kind" DEFAULT 'experiment',
  	"cover_image_id" integer,
  	"live_url" varchar,
  	"github_url" varchar,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vibe_projects_locales" (
  	"title" varchar,
  	"teaser" varchar,
  	"context" varchar,
  	"approach" jsonb,
  	"learnings" varchar,
  	"outcome" varchar,
  	"_status" "enum_vibe_projects_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "vibe_projects_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "vibe_projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"vibe_tags_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_vibe_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_kind" "enum__vibe_projects_v_version_kind" DEFAULT 'experiment',
  	"version_cover_image_id" integer,
  	"version_live_url" varchar,
  	"version_github_url" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"published_locale" "enum__vibe_projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_vibe_projects_v_locales" (
  	"version_title" varchar,
  	"version_teaser" varchar,
  	"version_context" varchar,
  	"version_approach" jsonb,
  	"version_learnings" varchar,
  	"version_outcome" varchar,
  	"version__status" "enum__vibe_projects_v_version_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_vibe_projects_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_vibe_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"vibe_tags_id" integer,
  	"users_id" integer
  );
  
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_prefix" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile__objectkey" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_wide_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_wide_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_wide_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_wide_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_wide_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_wide_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_wide_prefix" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_tile_wide__objectkey" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_hero_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_hero_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_hero_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_hero_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_hero_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_hero_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_hero_prefix" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_vibe_hero__objectkey" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_url" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_width" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_height" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_mime_type" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_filesize" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_filename" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_prefix" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile__objectkey" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_wide_url" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_wide_width" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_wide_height" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_wide_mime_type" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_wide_filesize" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_wide_filename" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_wide_prefix" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_tile_wide__objectkey" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_hero_url" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_hero_width" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_hero_height" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_hero_mime_type" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_hero_filesize" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_hero_filename" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_hero_prefix" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_vibe_hero__objectkey" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vibe_tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vibe_projects_id" integer;
  ALTER TABLE "vibe_tags_locales" ADD CONSTRAINT "vibe_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vibe_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vibe_tags_rels" ADD CONSTRAINT "vibe_tags_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vibe_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vibe_tags_rels" ADD CONSTRAINT "vibe_tags_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vibe_tags_v" ADD CONSTRAINT "_vibe_tags_v_parent_id_vibe_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vibe_tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vibe_tags_v_locales" ADD CONSTRAINT "_vibe_tags_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_vibe_tags_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vibe_tags_v_rels" ADD CONSTRAINT "_vibe_tags_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_vibe_tags_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vibe_tags_v_rels" ADD CONSTRAINT "_vibe_tags_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vibe_projects" ADD CONSTRAINT "vibe_projects_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vibe_projects_locales" ADD CONSTRAINT "vibe_projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vibe_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vibe_projects_texts" ADD CONSTRAINT "vibe_projects_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vibe_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vibe_projects_rels" ADD CONSTRAINT "vibe_projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vibe_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vibe_projects_rels" ADD CONSTRAINT "vibe_projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vibe_projects_rels" ADD CONSTRAINT "vibe_projects_rels_vibe_tags_fk" FOREIGN KEY ("vibe_tags_id") REFERENCES "public"."vibe_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vibe_projects_rels" ADD CONSTRAINT "vibe_projects_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vibe_projects_v" ADD CONSTRAINT "_vibe_projects_v_parent_id_vibe_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vibe_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vibe_projects_v" ADD CONSTRAINT "_vibe_projects_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vibe_projects_v_locales" ADD CONSTRAINT "_vibe_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_vibe_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vibe_projects_v_texts" ADD CONSTRAINT "_vibe_projects_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_vibe_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vibe_projects_v_rels" ADD CONSTRAINT "_vibe_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_vibe_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vibe_projects_v_rels" ADD CONSTRAINT "_vibe_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vibe_projects_v_rels" ADD CONSTRAINT "_vibe_projects_v_rels_vibe_tags_fk" FOREIGN KEY ("vibe_tags_id") REFERENCES "public"."vibe_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vibe_projects_v_rels" ADD CONSTRAINT "_vibe_projects_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "vibe_tags_slug_idx" ON "vibe_tags" USING btree ("slug");
  CREATE INDEX "vibe_tags_updated_at_idx" ON "vibe_tags" USING btree ("updated_at");
  CREATE INDEX "vibe_tags_created_at_idx" ON "vibe_tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "vibe_tags_locales_parent_id_locale_unique" ON "vibe_tags_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "vibe_tags_rels_order_idx" ON "vibe_tags_rels" USING btree ("order");
  CREATE INDEX "vibe_tags_rels_parent_idx" ON "vibe_tags_rels" USING btree ("parent_id");
  CREATE INDEX "vibe_tags_rels_path_idx" ON "vibe_tags_rels" USING btree ("path");
  CREATE INDEX "vibe_tags_rels_users_id_idx" ON "vibe_tags_rels" USING btree ("users_id");
  CREATE INDEX "_vibe_tags_v_parent_idx" ON "_vibe_tags_v" USING btree ("parent_id");
  CREATE INDEX "_vibe_tags_v_version_version_slug_idx" ON "_vibe_tags_v" USING btree ("version_slug");
  CREATE INDEX "_vibe_tags_v_version_version_updated_at_idx" ON "_vibe_tags_v" USING btree ("version_updated_at");
  CREATE INDEX "_vibe_tags_v_version_version_created_at_idx" ON "_vibe_tags_v" USING btree ("version_created_at");
  CREATE INDEX "_vibe_tags_v_created_at_idx" ON "_vibe_tags_v" USING btree ("created_at");
  CREATE INDEX "_vibe_tags_v_updated_at_idx" ON "_vibe_tags_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_vibe_tags_v_locales_parent_id_locale_unique" ON "_vibe_tags_v_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "_vibe_tags_v_rels_order_idx" ON "_vibe_tags_v_rels" USING btree ("order");
  CREATE INDEX "_vibe_tags_v_rels_parent_idx" ON "_vibe_tags_v_rels" USING btree ("parent_id");
  CREATE INDEX "_vibe_tags_v_rels_path_idx" ON "_vibe_tags_v_rels" USING btree ("path");
  CREATE INDEX "_vibe_tags_v_rels_users_id_idx" ON "_vibe_tags_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "vibe_projects_slug_idx" ON "vibe_projects" USING btree ("slug");
  CREATE INDEX "vibe_projects_cover_image_idx" ON "vibe_projects" USING btree ("cover_image_id");
  CREATE INDEX "vibe_projects_order_idx" ON "vibe_projects" USING btree ("order");
  CREATE INDEX "vibe_projects_updated_at_idx" ON "vibe_projects" USING btree ("updated_at");
  CREATE INDEX "vibe_projects_created_at_idx" ON "vibe_projects" USING btree ("created_at");
  CREATE INDEX "vibe_projects__status_idx" ON "vibe_projects_locales" USING btree ("_status","_locale");
  CREATE UNIQUE INDEX "vibe_projects_locales_parent_id_locale_unique" ON "vibe_projects_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "vibe_projects_texts_order_parent" ON "vibe_projects_texts" USING btree ("order","parent_id");
  CREATE INDEX "vibe_projects_texts_locale_parent" ON "vibe_projects_texts" USING btree ("locale","parent_id");
  CREATE INDEX "vibe_projects_rels_order_idx" ON "vibe_projects_rels" USING btree ("order");
  CREATE INDEX "vibe_projects_rels_parent_idx" ON "vibe_projects_rels" USING btree ("parent_id");
  CREATE INDEX "vibe_projects_rels_path_idx" ON "vibe_projects_rels" USING btree ("path");
  CREATE INDEX "vibe_projects_rels_media_id_idx" ON "vibe_projects_rels" USING btree ("media_id");
  CREATE INDEX "vibe_projects_rels_vibe_tags_id_idx" ON "vibe_projects_rels" USING btree ("vibe_tags_id");
  CREATE INDEX "vibe_projects_rels_users_id_idx" ON "vibe_projects_rels" USING btree ("users_id");
  CREATE INDEX "_vibe_projects_v_parent_idx" ON "_vibe_projects_v" USING btree ("parent_id");
  CREATE INDEX "_vibe_projects_v_version_version_slug_idx" ON "_vibe_projects_v" USING btree ("version_slug");
  CREATE INDEX "_vibe_projects_v_version_version_cover_image_idx" ON "_vibe_projects_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_vibe_projects_v_version_version_order_idx" ON "_vibe_projects_v" USING btree ("version_order");
  CREATE INDEX "_vibe_projects_v_version_version_updated_at_idx" ON "_vibe_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_vibe_projects_v_version_version_created_at_idx" ON "_vibe_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_vibe_projects_v_created_at_idx" ON "_vibe_projects_v" USING btree ("created_at");
  CREATE INDEX "_vibe_projects_v_updated_at_idx" ON "_vibe_projects_v" USING btree ("updated_at");
  CREATE INDEX "_vibe_projects_v_published_locale_idx" ON "_vibe_projects_v" USING btree ("published_locale");
  CREATE INDEX "_vibe_projects_v_latest_idx" ON "_vibe_projects_v" USING btree ("latest");
  CREATE INDEX "_vibe_projects_v_version_version__status_idx" ON "_vibe_projects_v_locales" USING btree ("version__status","_locale");
  CREATE UNIQUE INDEX "_vibe_projects_v_locales_parent_id_locale_unique" ON "_vibe_projects_v_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "_vibe_projects_v_texts_order_parent" ON "_vibe_projects_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_vibe_projects_v_texts_locale_parent" ON "_vibe_projects_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_vibe_projects_v_rels_order_idx" ON "_vibe_projects_v_rels" USING btree ("order");
  CREATE INDEX "_vibe_projects_v_rels_parent_idx" ON "_vibe_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_vibe_projects_v_rels_path_idx" ON "_vibe_projects_v_rels" USING btree ("path");
  CREATE INDEX "_vibe_projects_v_rels_media_id_idx" ON "_vibe_projects_v_rels" USING btree ("media_id");
  CREATE INDEX "_vibe_projects_v_rels_vibe_tags_id_idx" ON "_vibe_projects_v_rels" USING btree ("vibe_tags_id");
  CREATE INDEX "_vibe_projects_v_rels_users_id_idx" ON "_vibe_projects_v_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vibe_tags_fk" FOREIGN KEY ("vibe_tags_id") REFERENCES "public"."vibe_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vibe_projects_fk" FOREIGN KEY ("vibe_projects_id") REFERENCES "public"."vibe_projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_variants_vibe_tile_variants_vibe_tile_filename_idx" ON "media" USING btree ("variants_vibe_tile_filename");
  CREATE INDEX "media_variants_vibe_tile_wide_variants_vibe_tile_wide_fi_idx" ON "media" USING btree ("variants_vibe_tile_wide_filename");
  CREATE INDEX "media_variants_vibe_hero_variants_vibe_hero_filename_idx" ON "media" USING btree ("variants_vibe_hero_filename");
  CREATE INDEX "_media_v_version_variants_vibe_tile_version_variants_vib_idx" ON "_media_v" USING btree ("version_variants_vibe_tile_filename");
  CREATE INDEX "_media_v_version_variants_vibe_tile_wide_version_variant_idx" ON "_media_v" USING btree ("version_variants_vibe_tile_wide_filename");
  CREATE INDEX "_media_v_version_variants_vibe_hero_version_variants_vib_idx" ON "_media_v" USING btree ("version_variants_vibe_hero_filename");
  CREATE INDEX "payload_locked_documents_rels_vibe_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("vibe_tags_id");
  CREATE INDEX "payload_locked_documents_rels_vibe_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("vibe_projects_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vibe_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vibe_tags_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vibe_tags_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_vibe_tags_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_vibe_tags_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_vibe_tags_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vibe_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vibe_projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vibe_projects_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vibe_projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_vibe_projects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_vibe_projects_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_vibe_projects_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_vibe_projects_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "vibe_tags" CASCADE;
  DROP TABLE "vibe_tags_locales" CASCADE;
  DROP TABLE "vibe_tags_rels" CASCADE;
  DROP TABLE "_vibe_tags_v" CASCADE;
  DROP TABLE "_vibe_tags_v_locales" CASCADE;
  DROP TABLE "_vibe_tags_v_rels" CASCADE;
  DROP TABLE "vibe_projects" CASCADE;
  DROP TABLE "vibe_projects_locales" CASCADE;
  DROP TABLE "vibe_projects_texts" CASCADE;
  DROP TABLE "vibe_projects_rels" CASCADE;
  DROP TABLE "_vibe_projects_v" CASCADE;
  DROP TABLE "_vibe_projects_v_locales" CASCADE;
  DROP TABLE "_vibe_projects_v_texts" CASCADE;
  DROP TABLE "_vibe_projects_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vibe_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vibe_projects_fk";
  
  DROP INDEX "media_variants_vibe_tile_variants_vibe_tile_filename_idx";
  DROP INDEX "media_variants_vibe_tile_wide_variants_vibe_tile_wide_fi_idx";
  DROP INDEX "media_variants_vibe_hero_variants_vibe_hero_filename_idx";
  DROP INDEX "_media_v_version_variants_vibe_tile_version_variants_vib_idx";
  DROP INDEX "_media_v_version_variants_vibe_tile_wide_version_variant_idx";
  DROP INDEX "_media_v_version_variants_vibe_hero_version_variants_vib_idx";
  DROP INDEX "payload_locked_documents_rels_vibe_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_vibe_projects_id_idx";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_url";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_width";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_height";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_filename";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_prefix";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile__objectkey";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_wide_url";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_wide_width";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_wide_height";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_wide_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_wide_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_wide_filename";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_wide_prefix";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_tile_wide__objectkey";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_hero_url";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_hero_width";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_hero_height";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_hero_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_hero_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_hero_filename";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_hero_prefix";
  ALTER TABLE "media" DROP COLUMN "variants_vibe_hero__objectkey";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_url";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_width";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_height";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_mime_type";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_filesize";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_filename";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_prefix";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile__objectkey";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_wide_url";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_wide_width";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_wide_height";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_wide_mime_type";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_wide_filesize";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_wide_filename";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_wide_prefix";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_tile_wide__objectkey";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_hero_url";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_hero_width";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_hero_height";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_hero_mime_type";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_hero_filesize";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_hero_filename";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_hero_prefix";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_vibe_hero__objectkey";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vibe_tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vibe_projects_id";
  DROP TYPE "public"."enum_vibe_projects_kind";
  DROP TYPE "public"."enum_vibe_projects_status";
  DROP TYPE "public"."enum__vibe_projects_v_version_kind";
  DROP TYPE "public"."enum__vibe_projects_v_published_locale";
  DROP TYPE "public"."enum__vibe_projects_v_version_status";`);
}
