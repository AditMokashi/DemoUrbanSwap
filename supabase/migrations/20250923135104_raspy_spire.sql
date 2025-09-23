/*
  # Create swaps table

  1. New Tables
    - `swaps`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, foreign key to listings)
      - `requester_id` (uuid, foreign key to users)
      - `owner_id` (uuid, foreign key to users)
      - `message` (text, optional)
      - `offer_type` (text, not null)
      - `offer_details` (text, optional)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `swaps` table
    - Add policy for users to read their own swaps
    - Add policy for users to create swap requests
    - Add policy for users to update swap status
*/

CREATE TABLE IF NOT EXISTS swaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text,
  offer_type text NOT NULL CHECK (offer_type IN ('item', 'service', 'money', 'experience')),
  offer_details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own swaps"
  ON swaps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create swap requests"
  ON swaps
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update swap status"
  ON swaps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_swaps_listing_id ON swaps(listing_id);
CREATE INDEX IF NOT EXISTS idx_swaps_requester_id ON swaps(requester_id);
CREATE INDEX IF NOT EXISTS idx_swaps_owner_id ON swaps(owner_id);
CREATE INDEX IF NOT EXISTS idx_swaps_status ON swaps(status);
CREATE INDEX IF NOT EXISTS idx_swaps_created_at ON swaps(created_at DESC);