
-- Conversations table for DMs
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one uuid NOT NULL,
  participant_two uuid NOT NULL,
  last_message_at timestamptz DEFAULT now(),
  last_message_preview text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_one, participant_two)
);

-- Direct messages
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Guild channels
CREATE TABLE public.guild_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'general',
  description text DEFAULT '',
  channel_type text DEFAULT 'text',
  position integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Guild channel messages
CREATE TABLE public.guild_channel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES public.guild_channels(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  sender_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL DEFAULT '',
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_channel_messages ENABLE ROW LEVEL SECURITY;

-- RLS: conversations - participants can see their own
CREATE POLICY "Users see own conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users create conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users update own conversations" ON public.conversations
  FOR UPDATE TO authenticated
  USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- RLS: direct_messages - participants can see messages in their conversations
CREATE POLICY "Users see messages in their conversations" ON public.direct_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  ));

CREATE POLICY "Users send messages in their conversations" ON public.direct_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
  );

CREATE POLICY "Users update own messages" ON public.direct_messages
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid());

-- RLS: guild_channels - guild members can see
CREATE POLICY "Guild members see channels" ON public.guild_channels
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_channels.guild_id AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Guild leaders manage channels" ON public.guild_channels
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_channels.guild_id AND gm.user_id = auth.uid() AND gm.role IN ('leader', 'officer')
  ));

-- Public read for guild channels (for public guilds)
CREATE POLICY "Public can view channels of public guilds" ON public.guild_channels
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.guilds g WHERE g.id = guild_channels.guild_id AND g.is_public = true
  ));

-- RLS: guild_channel_messages
CREATE POLICY "Guild members see channel messages" ON public.guild_channel_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.guild_channels gc
    JOIN public.guild_members gm ON gm.guild_id = gc.guild_id
    WHERE gc.id = channel_id AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Guild members send channel messages" ON public.guild_channel_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.guild_channels gc
      JOIN public.guild_members gm ON gm.guild_id = gc.guild_id
      WHERE gc.id = channel_id AND gm.user_id = auth.uid()
    )
  );

-- Public can view messages in public guild channels
CREATE POLICY "Public view messages in public guilds" ON public.guild_channel_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.guild_channels gc
    JOIN public.guilds g ON g.id = gc.guild_id
    WHERE gc.id = channel_id AND g.is_public = true
  ));

-- Enable realtime for messaging
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_channel_messages;

-- Create indexes
CREATE INDEX idx_dm_conversation ON public.direct_messages(conversation_id, created_at);
CREATE INDEX idx_dm_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_conversations_p1 ON public.conversations(participant_one);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant_two);
CREATE INDEX idx_guild_channels_guild ON public.guild_channels(guild_id);
CREATE INDEX idx_guild_messages_channel ON public.guild_channel_messages(channel_id, created_at);
