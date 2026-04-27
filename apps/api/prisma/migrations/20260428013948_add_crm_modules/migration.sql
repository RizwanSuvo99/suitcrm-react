-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "industry" TEXT,
    "annual_revenue" DECIMAL(18,2),
    "employees" INTEGER,
    "billing_address" JSONB,
    "shipping_address" JSONB,
    "parent_account_id" UUID,
    "assigned_user_id" UUID,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calls" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "parent_id" UUID,
    "description" TEXT,
    "assigned_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Planned',
    "direction" TEXT NOT NULL DEFAULT 'Outbound',
    "parent_type" TEXT,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_counters" (
    "tenant_id" UUID NOT NULL,
    "last_value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "case_counters_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "case_number" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "account_id" UUID,
    "contact_id" UUID,
    "type" TEXT,
    "assigned_user_id" UUID,
    "description" TEXT,
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'New',
    "priority" TEXT NOT NULL DEFAULT 'Medium',

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone_work" TEXT,
    "phone_mobile" TEXT,
    "account_id" UUID,
    "assigned_user_id" UUID,
    "do_not_call" BOOLEAN NOT NULL DEFAULT false,
    "lead_source" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "lead_source" TEXT,
    "assigned_user_id" UUID,
    "converted_at" TIMESTAMP(3),
    "converted_contact_id" UUID,
    "converted_account_id" UUID,
    "converted_opportunity_id" UUID,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'New',

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "location" TEXT,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "parent_id" UUID,
    "description" TEXT,
    "assigned_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Planned',
    "parent_type" TEXT,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "parent_id" UUID,
    "assigned_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "parent_type" TEXT,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "account_id" UUID,
    "amount" DECIMAL(18,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "probability" INTEGER,
    "close_date" DATE,
    "lead_source" TEXT,
    "assigned_user_id" UUID,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "sales_stage" TEXT NOT NULL DEFAULT 'Prospecting',

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "due_date" DATE,
    "parent_id" UUID,
    "description" TEXT,
    "assigned_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "parent_type" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_tenant_id_deleted_at_idx" ON "accounts"("tenant_id" ASC, "deleted_at" ASC);

-- CreateIndex
CREATE INDEX "accounts_tenant_id_idx" ON "accounts"("tenant_id" ASC);

-- CreateIndex
CREATE INDEX "accounts_tenant_id_name_idx" ON "accounts"("tenant_id" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "calls_tenant_id_deleted_at_idx" ON "calls"("tenant_id" ASC, "deleted_at" ASC);

-- CreateIndex
CREATE INDEX "calls_tenant_id_idx" ON "calls"("tenant_id" ASC);

-- CreateIndex
CREATE INDEX "calls_tenant_id_parent_type_parent_id_idx" ON "calls"("tenant_id" ASC, "parent_type" ASC, "parent_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "cases_tenant_id_case_number_key" ON "cases"("tenant_id" ASC, "case_number" ASC);

-- CreateIndex
CREATE INDEX "cases_tenant_id_deleted_at_idx" ON "cases"("tenant_id" ASC, "deleted_at" ASC);

-- CreateIndex
CREATE INDEX "cases_tenant_id_idx" ON "cases"("tenant_id" ASC);

-- CreateIndex
CREATE INDEX "cases_tenant_id_status_idx" ON "cases"("tenant_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "contacts_tenant_id_account_id_idx" ON "contacts"("tenant_id" ASC, "account_id" ASC);

-- CreateIndex
CREATE INDEX "contacts_tenant_id_deleted_at_idx" ON "contacts"("tenant_id" ASC, "deleted_at" ASC);

-- CreateIndex
CREATE INDEX "contacts_tenant_id_idx" ON "contacts"("tenant_id" ASC);

-- CreateIndex
CREATE INDEX "contacts_tenant_id_last_name_first_name_idx" ON "contacts"("tenant_id" ASC, "last_name" ASC, "first_name" ASC);

-- CreateIndex
CREATE INDEX "leads_tenant_id_deleted_at_idx" ON "leads"("tenant_id" ASC, "deleted_at" ASC);

-- CreateIndex
CREATE INDEX "leads_tenant_id_idx" ON "leads"("tenant_id" ASC);

-- CreateIndex
CREATE INDEX "leads_tenant_id_last_name_first_name_idx" ON "leads"("tenant_id" ASC, "last_name" ASC, "first_name" ASC);

-- CreateIndex
CREATE INDEX "leads_tenant_id_status_idx" ON "leads"("tenant_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "meetings_tenant_id_deleted_at_idx" ON "meetings"("tenant_id" ASC, "deleted_at" ASC);

-- CreateIndex
CREATE INDEX "meetings_tenant_id_idx" ON "meetings"("tenant_id" ASC);

-- CreateIndex
CREATE INDEX "meetings_tenant_id_parent_type_parent_id_idx" ON "meetings"("tenant_id" ASC, "parent_type" ASC, "parent_id" ASC);

-- CreateIndex
CREATE INDEX "meetings_tenant_id_starts_at_idx" ON "meetings"("tenant_id" ASC, "starts_at" ASC);

-- CreateIndex
CREATE INDEX "notes_tenant_id_deleted_at_idx" ON "notes"("tenant_id" ASC, "deleted_at" ASC);

-- CreateIndex
CREATE INDEX "notes_tenant_id_idx" ON "notes"("tenant_id" ASC);

-- CreateIndex
CREATE INDEX "notes_tenant_id_parent_type_parent_id_idx" ON "notes"("tenant_id" ASC, "parent_type" ASC, "parent_id" ASC);

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_account_id_idx" ON "opportunities"("tenant_id" ASC, "account_id" ASC);

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_deleted_at_idx" ON "opportunities"("tenant_id" ASC, "deleted_at" ASC);

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_idx" ON "opportunities"("tenant_id" ASC);

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_sales_stage_idx" ON "opportunities"("tenant_id" ASC, "sales_stage" ASC);

-- CreateIndex
CREATE INDEX "tasks_tenant_id_deleted_at_idx" ON "tasks"("tenant_id" ASC, "deleted_at" ASC);

-- CreateIndex
CREATE INDEX "tasks_tenant_id_idx" ON "tasks"("tenant_id" ASC);

-- CreateIndex
CREATE INDEX "tasks_tenant_id_parent_type_parent_id_idx" ON "tasks"("tenant_id" ASC, "parent_type" ASC, "parent_id" ASC);

-- CreateIndex
CREATE INDEX "tasks_tenant_id_status_idx" ON "tasks"("tenant_id" ASC, "status" ASC);

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_parent_account_id_fkey" FOREIGN KEY ("parent_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

