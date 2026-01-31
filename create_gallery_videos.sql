-- Create a table for gallery videos
create table gallery_videos (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  url text not null,
  storage_path text,
  display_order integer default 0,
  user_id uuid references auth.users(id)
);

-- Enable Row Level Security (RLS)
alter table gallery_videos enable row level security;

-- Create policies (assuming similar to gallery_images)
-- Allow public read access
create policy "Public videos are viewable by everyone"
  on gallery_videos for select
  using ( true );

-- Allow authenticated users (admins) to insert, update, delete
create policy "Authenticated users can upload videos"
  on gallery_videos for insert
  with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can update videos"
  on gallery_videos for update
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can delete videos"
  on gallery_videos for delete
  using ( auth.role() = 'authenticated' );
