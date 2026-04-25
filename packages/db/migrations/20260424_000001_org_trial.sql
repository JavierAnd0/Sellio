-- Add trial_ends_at to organizations for the 20-day free trial system
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz NULL;
