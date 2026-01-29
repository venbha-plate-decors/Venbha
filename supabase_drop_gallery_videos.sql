-- Drop the gallery_videos table and its policies (dropping the table cascades to policies)
drop table if exists public.gallery_videos;

-- Optional: If you ever decide to re-add videos as part of gallery_images, nothing needs to be done here 
-- as we are just removing the separate table logic.
