
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// Base de datos conectar para el render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Pagina gamer
app.get('/', async (req, res) => {
  let resultados = [];
  let errorDb = null;

  try {
    const client = await pool.connect();
  
    const result = await client.query('SELECT * FROM puntuaciones');
    resultados = result.rows;
    client.release();
  } catch (err) {
    console.error("Error leyendo BD:", err);
    errorDb = err;
  }
//Diseño De estilo gamer de la pagina
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Gamer Profile</title>
      <style>
        body { background-color: #0f0f0f; color: #00ff41; font-family: 'Courier New', monospace; text-align: center; padding: 20px; }
        h1 { text-shadow: 2px 2px #bc13fe; font-size: 3rem; }
        .container { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-top: 30px; }
        .card { border: 2px solid #bc13fe; background: #1a1a1a; padding: 20px; width: 300px; box-shadow: 0 0 15px #bc13fe; border-radius: 10px; }
        .card:hover { transform: scale(1.05); transition: 0.3s; }
        .btn { background: #bc13fe; color: white; padding: 15px 30px; text-decoration: none; font-size: 1.2rem; border-radius: 5px; display: inline-block; margin-top: 20px; border: none; cursor: pointer; }
        .btn:hover { background: #d45bff; }
        .error { color: red; border: 1px solid red; padding: 10px; display: inline-block; }
      </style>
    </head>
    <body>
      <h1>GAME OVER - HIGHSCORES</h1>
      
      ${errorDb ? `<div class="error"> La base de datos no está lista o no conectada. <br> Usa el botón de abajo.</div>` : ''}

      <div class="container">
        ${resultados.length > 0 ? resultados.map(r => `
          <div class="card">
            <h2 style="color: #bc13fe">${r.nickname}</h2>
            <p><strong>Juego:</strong> ${r.juego_favorito}</p>
            <p><em>"${r.mensaje}"</em></p>
          </div>
        `).join('') : '<p>No hay datos cargados aún...</p>'}
      </div>

      <br><br><br>
      <hr style="border-color: #333">
      <h3>Zona de Mantenimiento</h3>
      <p>Si es la primera vez que entras o la tabla se borró:</p>
      <a href="/restaurar-backup" class="btn">🔌 RESTAURAR BASE DE DATOS (BACKUP)</a>
    </body>
    </html>
  `);
});


app.get('/restaurar-backup', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Ejecutar el archivo sql
    await client.query(`
      CREATE TABLE IF NOT EXISTS puntuaciones (
          id SERIAL PRIMARY KEY,
          nickname VARCHAR(50) NOT NULL,
          juego_favorito VARCHAR(100),
          mensaje TEXT
      );
      
    
      TRUNCATE TABLE puntuaciones;

      
      INSERT INTO puntuaciones (nickname, juego_favorito, mensaje) VALUES 
      ('PlayerOne', 'Elden Ring', '¡El mejor juego de la historia!'),
      ('NoobMaster', 'Fortnite', 'Buscando duo para rankeds.');
    `);
    
    client.release();
    res.send(`
        <h1 style="color:green; font-family:sans-serif; text-align:center; margin-top:50px;">✅ BACKUP RESTAURADO CON ÉXITO</h1>
        <p style="text-align:center"><a href="/">Volver a la página principal</a></p>
    `);
  } catch (err) {
    res.send(`<h1 style="color:red">ERROR: ${err.message}</h1>`);
  }
});

app.listen(port, () => {
  console.log(`Servidor Gamer (estilo.js) corriendo en puerto ${port}`);
});