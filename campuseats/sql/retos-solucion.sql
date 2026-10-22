SELECT nombre, precio FROM menu
WHERE stock > 0 AND precio < 5000
ORDER BY precio, nombre;

SELECT categoria, COUNT(*) AS cantidad FROM menu
GROUP BY categoria ORDER BY categoria;

SELECT ROUND(AVG(precio)) AS precio_promedio FROM menu;

SELECT nombre FROM menu WHERE stock = 0;

SELECT categoria, SUM(precio * stock) AS valor_inventario FROM menu
GROUP BY categoria ORDER BY valor_inventario DESC;

BEGIN;
UPDATE menu SET precio = precio * 110 / 100 WHERE categoria = 'Bebidas';
SELECT nombre, precio FROM menu WHERE categoria = 'Bebidas' ORDER BY id;
ROLLBACK;

INSERT INTO menu (nombre, categoria, precio) VALUES ('Promo loca', 'Snacks', -500);
INSERT INTO menu (nombre, categoria, precio) VALUES ('Empanada', 'Snacks', 2500);

BEGIN;
UPDATE menu SET stock = 0;
SELECT nombre, stock FROM menu ORDER BY id LIMIT 3;
ROLLBACK;
SELECT nombre, stock FROM menu ORDER BY id LIMIT 3;