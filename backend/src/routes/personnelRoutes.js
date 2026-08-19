const express = require('express');
const { getAllPersonnel, getPersonnel, updatePersonnel, deletePersonnel } = require('../controllers/personnelController');
const { verifyToken, verifyRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, getAllPersonnel);
router.get('/:id', verifyToken, getPersonnel);
router.put('/:id', verifyToken, verifyRole(['admin']), updatePersonnel);
router.delete('/:id', verifyToken, verifyRole(['admin']), deletePersonnel);

module.exports = router;
