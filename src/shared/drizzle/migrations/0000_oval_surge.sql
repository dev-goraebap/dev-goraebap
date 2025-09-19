-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "app_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"level" varchar(10) NOT NULL,
	"message" text NOT NULL,
	"method" varchar(10),
	"url" text,
	"status_code" integer,
	"response_time" integer,
	"user_id" integer,
	"session_id" varchar(128),
	"ip_address" "inet",
	"request_id" uuid,
	"error_message" text,
	"error_stack" text,
	"metadata" jsonb,
	"tags" text[] DEFAULT '{""}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_ips" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip_address" "inet" NOT NULL,
	"reason" text,
	"blocked_by" varchar(20) DEFAULT 'manual' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active_yn" varchar(1) DEFAULT 'Y' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"service_name" varchar(50) NOT NULL,
	"byte_size" integer NOT NULL,
	"checksum" varchar(255) NOT NULL,
	"created_by" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" text DEFAULT '{}' NOT NULL,
	CONSTRAINT "UQ_c4f1b1851cdf6d548a0ee9ac723" UNIQUE("key"),
	CONSTRAINT "UQ_febe111f2b2e443015faaa78f97" UNIQUE("checksum")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" varchar(255) NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"comment" varchar(1000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"post_id" integer,
	"deleted_at" timestamp,
	"avatar_no" integer NOT NULL,
	CONSTRAINT "UQ_1de549e1e015a53856120e1398f" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"record_type" varchar(100) NOT NULL,
	"record_id" varchar(100) NOT NULL,
	"blob_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"post_type" varchar(20) DEFAULT 'post' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"is_published_yn" varchar DEFAULT 'N' NOT NULL,
	CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"status" varchar(20) DEFAULT 'PLAN' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"slug" varchar(255) NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"is_published_yn" varchar DEFAULT 'N' NOT NULL,
	CONSTRAINT "UQ_68b808a9039892c61219f868f2a" UNIQUE("name"),
	CONSTRAINT "UQ_aabf879e0e06d1b37922d5c9664" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(254) NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "series_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer DEFAULT 999 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"series_id" integer,
	"post_id" integer
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "PK_deee54a40024b7afc16d25684f8" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "FK_2ed76e5e068bbf7ad4e5c4c7c5e" FOREIGN KEY ("blob_id") REFERENCES "public"."blobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "FK_49e0b924b7da7f822f0983cf9f9" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_posts" ADD CONSTRAINT "FK_fbe5d292df00b06f7648dcdbc0a" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_posts" ADD CONSTRAINT "FK_82763ddacb297fb7b7a907ecd97" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "FK_74603743868d1e4f4fc2c0225b6" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "FK_192ab488d1c284ac9abe2e30356" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_app_logs_level" ON "app_logs" USING btree ("level" text_ops);--> statement-breakpoint
CREATE INDEX "idx_app_logs_level_timestamp" ON "app_logs" USING btree ("level" timestamptz_ops,"timestamp" text_ops);--> statement-breakpoint
CREATE INDEX "idx_app_logs_metadata" ON "app_logs" USING gin ("metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_app_logs_tags" ON "app_logs" USING gin ("tags" array_ops);--> statement-breakpoint
CREATE INDEX "idx_app_logs_timestamp" ON "app_logs" USING btree ("timestamp" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_app_logs_user_id" ON "app_logs" USING btree ("user_id" int4_ops) WHERE (user_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "IDX_6ee844ff70dc272825209c1e9e" ON "blocked_ips" USING btree ("is_active_yn" text_ops,"expires_at" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "IDX_d9a4a34a43215adb2f0c361283" ON "blocked_ips" USING btree ("ip_address" inet_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "IDX_823166e73b133d4617427ce3c9" ON "series_posts" USING btree ("series_id" int4_ops,"post_id" int4_ops);--> statement-breakpoint
CREATE INDEX "IDX_192ab488d1c284ac9abe2e3035" ON "post_tags" USING btree ("tag_id" int4_ops);--> statement-breakpoint
CREATE INDEX "IDX_5df4e8dc2cb3e668b962362265" ON "post_tags" USING btree ("post_id" int4_ops);
*/