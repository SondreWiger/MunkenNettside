-- Seed Data for Development
-- Version 1.0

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_message', '{"title": "Velkommen til Teateret", "subtitle": "Opplev magien på scenen"}'::jsonb),
  ('featured_ensembles', '[]'::jsonb),
  ('contact_info', '{"email": "kontakt@teateret.no", "phone": "+47 123 45 678", "address": "Teaterveien 1, 0123 Oslo"}'::jsonb),
  ('social_links', '{"facebook": "", "instagram": "", "youtube": ""}'::jsonb),
  ('about_text', '"Vi er et lokalt teater med fokus på kvalitetsforestillinger for hele familien."'::jsonb),
  ('booking_terms', '"Billetter refunderes ikke etter kjøp. Ved avlysning vil du motta full refusjon."'::jsonb),
  ('faq', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert a sample venue
INSERT INTO public.venues (id, name, address, postal_code, city, capacity, seat_map_config, accessibility_info, parking_info, public_transport) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Hovedscenen',
    'Teaterveien 1',
    '0123',
    'Oslo',
    150,
    '{
      "sections": [
        {
          "name": "Parkett",
          "rows": [
            {"number": "A", "seats": [1,2,3,4,5,6,7,8,9,10]},
            {"number": "B", "seats": [1,2,3,4,5,6,7,8,9,10]},
            {"number": "C", "seats": [1,2,3,4,5,6,7,8,9,10]},
            {"number": "D", "seats": [1,2,3,4,5,6,7,8,9,10]},
            {"number": "E", "seats": [1,2,3,4,5,6,7,8,9,10]}
          ]
        },
        {
          "name": "Balkong",
          "rows": [
            {"number": "F", "seats": [1,2,3,4,5,6,7,8]},
            {"number": "G", "seats": [1,2,3,4,5,6,7,8]}
          ]
        }
      ]
    }'::jsonb,
    'Rullestoltilgang via hovedinngang. HC-toalett tilgjengelig.',
    'Parkering tilgjengelig i garasjeanlegg ved siden av bygget.',
    'Nærmeste T-bane: Nationaltheatret (5 min gange)'
  )
ON CONFLICT DO NOTHING;
