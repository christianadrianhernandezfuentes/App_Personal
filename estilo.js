
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// Conexión a BD
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// La Web Gamer 
app.get('/', async (req, res) => {
  let data = [];
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM puntuaciones');
    data = result.rows;
    client.release();
  } catch (err) {
    console.error(err);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Gamer Zone</title>
      <style>
        body { background-color: #0b0b0b; color: #00ff00; font-family: 'Courier New', monospace; text-align: center; padding: 20px; }
        h1 { text-shadow: 0 0 10px #00ff00; }
        .grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-top: 40px; }
        .card { border: 1px solid #9d00ff; background: #141414; padding: 15px; width: 250px; box-shadow: 0 0 8px #9d00ff; }
        .nick { font-weight: bold; color: #d600ff; }
        .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; border: 1px solid #fff; color: #fff; text-decoration: none; }
        .btn:hover { background: #fff; color: #000; }
      </style>
    </head>
    <body>
      <h1>GAME DATABASE</h1>
      <p>Proyecto: Dependencia | Servidor: estilo.js</p>
      
      <div class="grid">
        ${data.length > 0 ? data.map(user => `
          <div class="card">
            <div class="nick">${user.nickname}</div>
            <div>Juego: ${user.juego_favorito}</div>
            <div>"${user.mensaje}"</div>
          </div>
        `).join('') : '<p>Base de datos vacía o no conectada.</p>'}
      </div>
      
      <br><br>
      <a href="/setup-db" class="btn">CLICK AQUÍ PARA CREAR TABLAS (SETUP)</a>
    </body>
    </html>
  `);
});

app.get('/setup-db', async (req, res) => {
  try {
    const client = await pool.connect();
    
  
    await client.query(`
      CREATE TABLE IF NOT EXISTS puntuaciones (
        id SERIAL PRIMARY KEY,
        nickname VARCHAR(50),
        juego_favorito VARCHAR(100),
        mensaje TEXT
      );
    `);
    
    
    await client.query(`
      INSERT INTO puntuaciones (nickname, juego_favorito, mensaje) VALUES 
      ('AdminGamer', 'System Shock', 'Base de datos inicializada con éxito.'),
      ('Player2', 'Minecraft', 'Buscando diamantes...'),
      ('SpeedRunner', 'Super Metroid', 'Record mundial any%');
    `);
    
    client.release();
    res.send("<h1>Eso eso</h1><p>Tablas creadas y datos insertados. <a href='/'>Volver al inicio</a></p>");
  } catch (err) {
    res.send("<h1>No carga</h1><pre>" + err + "</pre>");
  }
});

app.listen(port, () => {
  console.log(`Iniciando estilo.js en puerto ${port}`);
});