DROP TYPE IF EXISTS ocazii_flori CASCADE;
DROP TYPE IF EXISTS tipuri_flori CASCADE;
DROP TYPE IF EXISTS culori_flori CASCADE;
DROP TABLE IF EXISTS flori CASCADE;

CREATE TYPE ocazii_flori AS ENUM('nunta', '1-8 martie', 'onomastica', E'Valentine\'s Day', 'diverse');
CREATE TYPE tipuri_flori AS ENUM('Flori la bucata', 'Buchete', 'Flori in ghiveci', 'Cosuri cu flori');
CREATE TYPE culori_flori AS ENUM('galben', 'portocaliu', 'multicolor', 'rosu', 'verde', 'violet', 'roz', 'alb');

CREATE TABLE IF NOT EXISTS flori (
   id serial PRIMARY KEY, --a
   nume VARCHAR(50) UNIQUE NOT NULL, --b
   descriere TEXT, --c
   imagine VARCHAR(300), --d
   tip_produs tipuri_flori DEFAULT 'Buchete', --e
   ocazie ocazii_flori DEFAULT 'diverse', --f
   pret NUMERIC(8,2) NOT NULL, --g
   num_fire INT CHECK (num_fire>=0), --h
   data_adaugare TIMESTAMP DEFAULT current_timestamp, --i
   culoare culori_flori DEFAULT 'multicolor', --j
   flori_continute VARCHAR [], --k
   ridicare_personala BOOLEAN NOT NULL DEFAULT FALSE --l
);

INSERT into flori (nume,descriere,imagine,tip_produs,ocazie,pret,num_fire,culoare,flori_continute,ridicare_personala) VALUES 
('Crizantema', 'Fir de crizantema', 'fir_crizantema.png', 'Flori la bucata', 'diverse', 11, 1, 'portocaliu', '{"crizantema"}', False),

('Buchet trandafiri', 'Buchet galben de trandafiri', 'buchet_trandafiri_galbeni.png', 'Buchete', 'onomastica', 175.5, 15, 'galben', '{"trandafir"," crizantema"}', True),

('Buchet lalele', 'Buchet vesel de lalele', 'buchet_lalele.png', 'Buchete', '1-8 martie', 75.5, 9, 'alb', '{"lalea"}', True),

('Cos cu trandafiri', 'Cos de trandafiri pastelati', 'cos_cu_trandafiri.png', 'Cosuri cu flori', 'onomastica', 200, 11, 'roz', '{"trandafir", " gypsophila"}', True),

('Cos cu garoafe', 'Cos cu flori in culori vii', 'cos_violet.png', 'Cosuri cu flori', E'Valentine\'s Day', 165.5, 23, 'violet', '{"trandafir", " garoafa"}', True),

('Cactus', 'Cactus in ghiveci', 'cactus_ghiveci.png', 'Flori in ghiveci', 'diverse', 20, 1, 'verde', '{"catus"}', False),

('Dalie', 'Dalie in ghiveci', 'dalie_ghiveci.png', 'Flori in ghiveci', 'diverse', 50, 1, 'portocaliu', '{"dalie"}', False),

('Trandafir rosu', 'Fir de trandafir rosu', 'fir_trandafir.png', 'Flori la bucata', 'diverse', 15, 1, 'rosu', '{"trandafir"}', False),

('Lalea', 'Fir de lalea', 'fir_lalea.png', 'Flori la bucata', 'diverse', 7, 1, 'alb', '{"lalea"}', False),

('Buchet bujori roz', 'Buchet de bujori parfumati', 'buchet_bujori.png', 'Buchete', E'Valentine\'s Day', 120, 5, 'roz', '{"bujor"}', True),

('Crizantema verde', 'Fir de crizantema verde', 'fir_crizantema_verde.png', 'Flori la bucata', 'diverse', 10, 1, 'verde', '{"crizantema"}', False),

('Trandafir roz', 'Fir de trandafir roz', 'fir_trandafir_roz.png', 'Flori la bucata', 'diverse', 15, 1, 'roz', '{"trandafir"}', False),

('Buchet de primvara', 'Buchet primavaratic', 'buchet_primavara.png', 'Buchete', '1-8 martie', 119.5, 17, 'roz', '{"garoafa", " lalea", " crizantema", " margareta"}', True),

('Buchet de mireasa I', 'Buchet de mireasa multicolor', 'buchet_mireasa_1.png', 'Buchete', 'nunta', 230, 31, 'multicolor', '{"dalie", " trandafir", " frezie"}', False),

('Buchet de mireasa II', 'Buchet de mireasa in culori vibrante', 'buchet_mireasa_2.png', 'Buchete', 'nunta', 230, 31, 'multicolor', '{"dalie", " trandafir", " frezie"}', False),

('Buchet de mireasa III', 'Buchet de mireasa clasic', 'buchet_mireasa_3.png', 'Buchete', 'nunta', 230, 31, 'multicolor', '{"dalie", " trandafir", " frezie"}', False),

('Buchet bujori albi', 'Buchet delicat de bujori albi', 'buchet_bujori_iarna.png', 'Buchete', 'diverse', 130, 11, 'alb', '{"bujor"}', False),

('Buchet de vara', 'Buchet de flori inedite', 'buchet_vara.png', 'Buchete', 'diverse', 156.5, 27, 'galben', '{"craspedia"}', False),

('Buchet multicolor', 'Buchet de flori variate si colorate', 'buchet_multicolor.png', 'Buchete', 'diverse', 179.5, 21, 'multicolor', '{"crizantema", " margareta", " garoafa"}', False),

('Craciunita', 'Floare festiva in ghiveci', 'craciunita.png', 'Flori in ghiveci', 'diverse', 29.5, 1, 'rosu', '{"craciunita"}', False),

('Buchet de toamna', 'Buchet de trandafiri in culori calde', 'buchet_toamna.png', 'Buchete', 'diverse', 182.5, 29, 'portocaliu', '{"trandafir"}', False),

('Cos de toamna', 'Cos de trandafiri in culori tomnatice', 'cos_toamna.png', 'Cosuri cu flori', 'diverse', 210, 33, 'portocaliu', '{"trandafir"}', False),

('Cos aramiu', 'Cos cu flori aramii', 'cos_aramiu.png', 'Cosuri cu flori', 'diverse', 200, 21, 'portocaliu', '{"trandafir", " garoafa"}', False),

('Buchet tradafiri rosii', 'Buchet de trandafiri viu colorati', 'buchet_trandafiri_rosii.png', 'Buchete', 'diverse', 180, 21, 'rosu', '{"trandafir"}', False)