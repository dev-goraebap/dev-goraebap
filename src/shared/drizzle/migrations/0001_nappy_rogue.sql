CREATE TYPE "public"."active_yn" AS ENUM('Y', 'N');--> statement-breakpoint
CREATE TYPE "public"."published_yn" AS ENUM('Y', 'N');--> statement-breakpoint
CREATE TABLE "curated_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"link" text NOT NULL,
	"guid" text NOT NULL,
	"snippet" text,
	"pub_date" timestamp NOT NULL,
	"source" varchar(100) NOT NULL,
	"source_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "curated_items_link_unique" UNIQUE("link"),
	CONSTRAINT "curated_items_guid_unique" UNIQUE("guid")
);
--> statement-breakpoint
CREATE TABLE "curated_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"url" text NOT NULL,
	"is_active_yn" "active_yn" DEFAULT 'Y' NOT NULL,
	"fetch_interval_minutes" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blobs" DROP CONSTRAINT "UQ_c4f1b1851cdf6d548a0ee9ac723";--> statement-breakpoint
ALTER TABLE "blobs" DROP CONSTRAINT "UQ_febe111f2b2e443015faaa78f97";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "UQ_1de549e1e015a53856120e1398f";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "UQ_54ddf9075260407dcfdd7248577";--> statement-breakpoint
ALTER TABLE "series" DROP CONSTRAINT "UQ_68b808a9039892c61219f868f2a";--> statement-breakpoint
ALTER TABLE "series" DROP CONSTRAINT "UQ_aabf879e0e06d1b37922d5c9664";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3";--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "UQ_d90243459a697eadb8ad56e9092";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5";
--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT "FK_2ed76e5e068bbf7ad4e5c4c7c5e";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986";
--> statement-breakpoint
ALTER TABLE "series" DROP CONSTRAINT "FK_49e0b924b7da7f822f0983cf9f9";
--> statement-breakpoint
ALTER TABLE "series_posts" DROP CONSTRAINT "FK_fbe5d292df00b06f7648dcdbc0a";
--> statement-breakpoint
ALTER TABLE "series_posts" DROP CONSTRAINT "FK_82763ddacb297fb7b7a907ecd97";
--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "FK_74603743868d1e4f4fc2c0225b6";
--> statement-breakpoint
ALTER TABLE "post_tags" DROP CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d";
--> statement-breakpoint
ALTER TABLE "post_tags" DROP CONSTRAINT "FK_192ab488d1c284ac9abe2e30356";
--> statement-breakpoint
DROP INDEX "IDX_823166e73b133d4617427ce3c9";--> statement-breakpoint
DROP INDEX "IDX_192ab488d1c284ac9abe2e3035";--> statement-breakpoint
DROP INDEX "IDX_5df4e8dc2cb3e668b962362265";--> statement-breakpoint
ALTER TABLE "post_tags" DROP CONSTRAINT "PK_deee54a40024b7afc16d25684f8";--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "post_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "is_published_yn" SET DEFAULT 'N'::"public"."published_yn";--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "is_published_yn" SET DATA TYPE "public"."published_yn" USING "is_published_yn"::"public"."published_yn";--> statement-breakpoint
ALTER TABLE "series" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "series" ALTER COLUMN "is_published_yn" SET DEFAULT 'N'::"public"."published_yn";--> statement-breakpoint
ALTER TABLE "series" ALTER COLUMN "is_published_yn" SET DATA TYPE "public"."published_yn" USING "is_published_yn"::"public"."published_yn";--> statement-breakpoint
ALTER TABLE "series_posts" ALTER COLUMN "series_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "series_posts" ALTER COLUMN "post_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id");--> statement-breakpoint
ALTER TABLE "curated_items" ADD CONSTRAINT "curated_items_source_id_curated_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."curated_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_blob_id_blobs_id_fk" FOREIGN KEY ("blob_id") REFERENCES "public"."blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_posts" ADD CONSTRAINT "series_posts_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_posts" ADD CONSTRAINT "series_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blobs" ADD CONSTRAINT "blobs_key_unique" UNIQUE("key");--> statement-breakpoint
ALTER TABLE "blobs" ADD CONSTRAINT "blobs_checksum_unique" UNIQUE("checksum");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_request_id_unique" UNIQUE("request_id");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "series_posts" ADD CONSTRAINT "series_posts_series_id_post_id_unique" UNIQUE("series_id","post_id");--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_name_unique" UNIQUE("name");