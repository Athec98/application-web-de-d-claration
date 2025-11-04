const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth, admin } = require('../middleware/auth');
const Declaration = require('../models/Declaration');

// @route   GET api/declarations
// @desc    Get all declarations (for admin)
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const declarations = await Declaration.find().sort({ date: -1 });
    res.json(declarations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// @route   POST api/declarations
// @desc    Create a declaration
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('nomEnfant', 'Le nom de l\'enfant est requis').not().isEmpty(),
      check('prenomEnfant', 'Le prénom de l\'enfant est requis').not().isEmpty(),
      check('dateNaissance', 'La date de naissance est requise').not().isEmpty(),
      check('lieuNaissance', 'Le lieu de naissance est requis').not().isEmpty(),
      check('sexe', 'Le sexe est requis').not().isEmpty(),
      check('nomPere', 'Le nom du père est requis').not().isEmpty(),
      check('nomMere', 'Le nom de la mère est requis').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newDeclaration = new Declaration({
        user: req.user.id,
        ...req.body
      });

      const declaration = await newDeclaration.save();
      res.json(declaration);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur serveur');
    }
  }
);

// @route   GET api/declarations/:id
// @desc    Get declaration by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const declaration = await Declaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({ msg: 'Déclaration non trouvée' });
    }

    // Vérifier que l'utilisateur est autorisé à voir cette déclaration
    if (declaration.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Non autorisé' });
    }

    res.json(declaration);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Déclaration non trouvée' });
    }
    res.status(500).send('Erreur serveur');
  }
});

// @route   PUT api/declarations/:id
// @desc    Update declaration
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let declaration = await Declaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({ msg: 'Déclaration non trouvée' });
    }

    // Vérifier que l'utilisateur est le propriétaire de la déclaration
    if (declaration.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }

    declaration = await Declaration.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(declaration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// @route   DELETE api/declarations/:id
// @desc    Delete declaration
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const declaration = await Declaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({ msg: 'Déclaration non trouvée' });
    }

    // Vérifier que l'utilisateur est le propriétaire de la déclaration
    if (declaration.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }

    await declaration.remove();

    res.json({ msg: 'Déclaration supprimée' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Déclaration non trouvée' });
    }
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
