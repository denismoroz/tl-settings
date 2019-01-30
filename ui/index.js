const express = require('express')
const router = express.Router()


router.get('/', (req, res) => {
  res.render('settings')
});

router.put('/settings', async (req, res) => {
  const params = req.body
});


module.exports = router;

