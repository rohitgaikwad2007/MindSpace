'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

/* ════════════════════════════════
   MOODS
════════════════════════════════ */

router.get('/moods', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT emoji, label, note, date FROM moods ORDER BY created_at DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /moods:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/moods', async (req, res) => {
  try {
    const { emoji = '', label = '', note = '', date = '' } = req.body;
    await pool.query(
      'INSERT INTO moods (emoji, label, note, date) VALUES (?, ?, ?, ?)',
      [emoji, label, note, date]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /moods:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/* ════════════════════════════════
   JOURNALS
════════════════════════════════ */

router.get('/journals', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description AS `desc`, date FROM journals ORDER BY created_at DESC, id DESC'
    );
    // id comes back as BigInt from mysql2; convert to Number so JSON serialises correctly
    res.json(rows.map(r => ({ ...r, id: Number(r.id) })));
  } catch (err) {
    console.error('GET /journals:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/journals', async (req, res) => {
  try {
    const { id, title, desc = '', date = '' } = req.body;
    await pool.query(
      'INSERT INTO journals (id, title, description, date) VALUES (?, ?, ?, ?)',
      [id, title, desc, date]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /journals:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/journals/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM journals WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /journals/:id:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/* ════════════════════════════════
   PROFILE
════════════════════════════════ */

router.get('/profile', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT name, age, streak, last_visit AS lastVisit FROM profile WHERE id = 1'
    );
    res.json(rows[0] || { name: '', age: '', streak: 0, lastVisit: '' });
  } catch (err) {
    console.error('GET /profile:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { name = '', age = '', streak = 0, lastVisit = '' } = req.body;
    await pool.query(
      `INSERT INTO profile (id, name, age, streak, last_visit) VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name       = VALUES(name),
         age        = VALUES(age),
         streak     = VALUES(streak),
         last_visit = VALUES(last_visit)`,
      [name, age, streak, lastVisit]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /profile:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/* ════════════════════════════════
   HABITS
════════════════════════════════ */

router.get('/habits/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const [rows] = await pool.query(
      'SELECT id, name, goal, marks FROM habits WHERE year = ? AND month = ? ORDER BY created_at ASC, id ASC',
      [year, month]
    );
    res.json(rows.map(r => ({
      id:    Number(r.id),
      name:  r.name,
      goal:  r.goal,
      marks: r.marks || {},
    })));
  } catch (err) {
    console.error('GET /habits/:year/:month:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Replace the full habit list for a given year/month (upsert each habit, delete removed ones)
router.put('/habits/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const habits = req.body;
    if (!Array.isArray(habits)) {
      return res.status(400).json({ error: 'Request body must be an array of habits' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (habits.length > 0) {
        const ids = habits.map(h => h.id);
        const placeholders = ids.map(() => '?').join(',');
        await conn.query(
          `DELETE FROM habits WHERE year = ? AND month = ? AND id NOT IN (${placeholders})`,
          [year, month, ...ids]
        );
      } else {
        await conn.query('DELETE FROM habits WHERE year = ? AND month = ?', [year, month]);
      }

      for (const h of habits) {
        await conn.query(
          `INSERT INTO habits (id, year, month, name, goal, marks) VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name  = VALUES(name),
             goal  = VALUES(goal),
             marks = VALUES(marks)`,
          [h.id, year, month, h.name, h.goal, JSON.stringify(h.marks || {})]
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /habits/:year/:month:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/* ════════════════════════════════
   CLEAR ALL DATA
════════════════════════════════ */

router.delete('/data', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM moods');
      await conn.query('DELETE FROM journals');
      await conn.query('DELETE FROM habits');
      await conn.query(
        'UPDATE profile SET streak = 0, last_visit = "" WHERE id = 1'
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
