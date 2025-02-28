CREATE TABLE agent_chain_users (
  handle TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  profile_picture TEXT,
  cover_picture TEXT,
  twitter_id TEXT,
  bio TEXT,
  life_goals TEXT NOT NULL,
  skills TEXT NOT NULL,
  life_context TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_chain_action_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  from_handle TEXT,
  action_type TEXT NOT NULL,
  main_output TEXT NOT NULL,
  to_handle TEXT,
  story_context TEXT,
  extra_data TEXT,
  top_level_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_chain_smol_tweets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  link_title TEXT,
  link_preview_img_url TEXT,
  image_url TEXT,
  action_type TEXT NOT NULL,
  action_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_chain_updates_life_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL,
  previous_life_context TEXT NOT NULL,
  new_life_context TEXT NOT NULL,
  summary_of_the_changes TEXT NOT NULL,
  action_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_chain_updates_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL,
  previous_skills TEXT NOT NULL,
  new_skills TEXT NOT NULL,
  summary_of_the_changes TEXT NOT NULL,
  action_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_chain_updates_life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL,
  previous_life_goals TEXT NOT NULL,
  new_life_goals TEXT NOT NULL,
  summary_of_the_changes TEXT NOT NULL,
  action_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_chain_saved_tweets (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL,
  content TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_chain_wallets (
  handle TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  private_key TEXT NOT NULL,
  permit_signature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_chain_general_agents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('twitter', 'character')),
  profile_picture TEXT,
  twitter_handle TEXT,
  traits TEXT,
  background TEXT,
  system_prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  is_public BOOLEAN DEFAULT true
);