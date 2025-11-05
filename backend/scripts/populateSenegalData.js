require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Region = require('../models/Region');
const Departement = require('../models/Departement');
const Commune = require('../models/Commune');
const CommunauteRurale = require('../models/CommunauteRurale');
const Hopital = require('../models/Hopital');
const Mairie = require('../models/Mairie');

// Données des 14 régions du Sénégal avec leurs départements principaux
const senegalData = {
  regions: [
    {
      code: 'DK',
      nom: 'Dakar',
      chefLieu: 'Dakar',
      departements: [
        { code: 'DK-001', nom: 'Dakar', chefLieu: 'Dakar' },
        { code: 'DK-002', nom: 'Guédiawaye', chefLieu: 'Guédiawaye' },
        { code: 'DK-003', nom: 'Pikine', chefLieu: 'Pikine' },
        { code: 'DK-004', nom: 'Rufisque', chefLieu: 'Rufisque' }
      ]
    },
    {
      code: 'TH',
      nom: 'Thiès',
      chefLieu: 'Thiès',
      departements: [
        { code: 'TH-001', nom: 'Thiès', chefLieu: 'Thiès' },
        { code: 'TH-002', nom: 'M\'bour', chefLieu: 'M\'bour' },
        { code: 'TH-003', nom: 'Tivaouane', chefLieu: 'Tivaouane' }
      ]
    },
    {
      code: 'LG',
      nom: 'Louga',
      chefLieu: 'Louga',
      departements: [
        { code: 'LG-001', nom: 'Louga', chefLieu: 'Louga' },
        { code: 'LG-002', nom: 'Kébémer', chefLieu: 'Kébémer' },
        { code: 'LG-003', nom: 'Linguère', chefLieu: 'Linguère' }
      ]
    },
    {
      code: 'ST',
      nom: 'Saint-Louis',
      chefLieu: 'Saint-Louis',
      departements: [
        { code: 'ST-001', nom: 'Saint-Louis', chefLieu: 'Saint-Louis' },
        { code: 'ST-002', nom: 'Dagana', chefLieu: 'Dagana' },
        { code: 'ST-003', nom: 'Podor', chefLieu: 'Podor' }
      ]
    },
    {
      code: 'MT',
      nom: 'Matam',
      chefLieu: 'Matam',
      departements: [
        { code: 'MT-001', nom: 'Matam', chefLieu: 'Matam' },
        { code: 'MT-002', nom: 'Kanel', chefLieu: 'Kanel' },
        { code: 'MT-003', nom: 'Ranérou', chefLieu: 'Ranérou' }
      ]
    },
    {
      code: 'KG',
      nom: 'Kaffrine',
      chefLieu: 'Kaffrine',
      departements: [
        { code: 'KG-001', nom: 'Kaffrine', chefLieu: 'Kaffrine' },
        { code: 'KG-002', nom: 'Birkilane', chefLieu: 'Birkilane' },
        { code: 'KG-003', nom: 'Malem Hodar', chefLieu: 'Malem Hodar' }
      ]
    },
    {
      code: 'KD',
      nom: 'Kolda',
      chefLieu: 'Kolda',
      departements: [
        { code: 'KD-001', nom: 'Kolda', chefLieu: 'Kolda' },
        { code: 'KD-002', nom: 'Vélingara', chefLieu: 'Vélingara' },
        { code: 'KD-003', nom: 'Médina Yoro Foulah', chefLieu: 'Médina Yoro Foulah' }
      ]
    },
    {
      code: 'SL',
      nom: 'Sédhiou',
      chefLieu: 'Sédhiou',
      departements: [
        { code: 'SL-001', nom: 'Sédhiou', chefLieu: 'Sédhiou' },
        { code: 'SL-002', nom: 'Bounkiling', chefLieu: 'Bounkiling' },
        { code: 'SL-003', nom: 'Goudomp', chefLieu: 'Goudomp' }
      ]
    },
    {
      code: 'ZG',
      nom: 'Ziguinchor',
      chefLieu: 'Ziguinchor',
      departements: [
        { code: 'ZG-001', nom: 'Ziguinchor', chefLieu: 'Ziguinchor' },
        { code: 'ZG-002', nom: 'Bignona', chefLieu: 'Bignona' },
        { code: 'ZG-003', nom: 'Oussouye', chefLieu: 'Oussouye' }
      ]
    },
    {
      code: 'TC',
      nom: 'Tambacounda',
      chefLieu: 'Tambacounda',
      departements: [
        { code: 'TC-001', nom: 'Tambacounda', chefLieu: 'Tambacounda' },
        { code: 'TC-002', nom: 'Bakel', chefLieu: 'Bakel' },
        { code: 'TC-003', nom: 'Koumpentoum', chefLieu: 'Koumpentoum' },
        { code: 'TC-004', nom: 'Goudiry', chefLieu: 'Goudiry' }
      ]
    },
    {
      code: 'KL',
      nom: 'Kaolack',
      chefLieu: 'Kaolack',
      departements: [
        { code: 'KL-001', nom: 'Kaolack', chefLieu: 'Kaolack' },
        { code: 'KL-002', nom: 'Guinguinéo', chefLieu: 'Guinguinéo' },
        { code: 'KL-003', nom: 'Nioro du Rip', chefLieu: 'Nioro du Rip' }
      ]
    },
    {
      code: 'FD',
      nom: 'Fatick',
      chefLieu: 'Fatick',
      departements: [
        { code: 'FD-001', nom: 'Fatick', chefLieu: 'Fatick' },
        { code: 'FD-002', nom: 'Foundiougne', chefLieu: 'Foundiougne' },
        { code: 'FD-003', nom: 'Gossas', chefLieu: 'Gossas' }
      ]
    },
    {
      code: 'DB',
      nom: 'Diourbel',
      chefLieu: 'Diourbel',
      departements: [
        { code: 'DB-001', nom: 'Diourbel', chefLieu: 'Diourbel' },
        { code: 'DB-002', nom: 'Bambey', chefLieu: 'Bambey' },
        { code: 'DB-003', nom: 'Mbacké', chefLieu: 'Mbacké' }
      ]
    },
    {
      code: 'KDG',
      nom: 'Kédougou',
      chefLieu: 'Kédougou',
      departements: [
        { code: 'KDG-001', nom: 'Kédougou', chefLieu: 'Kédougou' },
        { code: 'KDG-002', nom: 'Salémata', chefLieu: 'Salémata' },
        { code: 'KDG-003', nom: 'Saraya', chefLieu: 'Saraya' }
      ]
    }
  ]
};

// Hôpitaux principaux du Sénégal (plus détaillés)
const hopitauxData = [
  // Dakar
  { nom: 'Hôpital Principal de Dakar', code: 'HPD-001', type: 'Hopital', region: 'DK', departement: 'DK-001', commune: null, adresse: 'Avenue Cheikh Anta Diop, Dakar', telephone: '+221 33 839 50 50', email: 'hpd@health.sn', delivreCertificat: true },
  { nom: 'Centre Hospitalier National d\'Enfants Albert Royer', code: 'CHNEAR-001', type: 'Hopital', region: 'DK', departement: 'DK-001', commune: null, adresse: 'Avenue Cheikh Anta Diop, Dakar', telephone: '+221 33 839 50 50', email: 'albertroyer@health.sn', delivreCertificat: true },
  { nom: 'Hôpital Général de Grand Yoff', code: 'HGGY-001', type: 'Hopital', region: 'DK', departement: 'DK-001', commune: null, adresse: 'Grand Yoff, Dakar', telephone: '+221 33 839 60 60', email: 'hggy@health.sn', delivreCertificat: true },
  { nom: 'Centre de Santé de Pikine', code: 'CSP-001', type: 'Centre de Santé', region: 'DK', departement: 'DK-003', commune: null, adresse: 'Pikine, Dakar', telephone: '+221 33 834 20 20', email: 'csp@health.sn', delivreCertificat: true },
  { nom: 'Centre de Santé de Rufisque', code: 'CSR-001', type: 'Centre de Santé', region: 'DK', departement: 'DK-004', commune: null, adresse: 'Rufisque, Dakar', telephone: '+221 33 836 10 10', email: 'csr@health.sn', delivreCertificat: true },
  
  // Thiès
  { nom: 'Hôpital Régional de Thiès', code: 'HRT-001', type: 'Hopital', region: 'TH', departement: 'TH-001', commune: null, adresse: 'Thiès', telephone: '+221 33 951 10 10', email: 'hrt@health.sn', delivreCertificat: true },
  { nom: 'Centre de Santé de M\'bour', code: 'CSMB-001', type: 'Centre de Santé', region: 'TH', departement: 'TH-002', commune: null, adresse: 'M\'bour, Thiès', telephone: '+221 33 957 10 10', email: 'csmb@health.sn', delivreCertificat: true },
  { nom: 'Centre de Santé de Tivaouane', code: 'CST-001', type: 'Centre de Santé', region: 'TH', departement: 'TH-003', commune: null, adresse: 'Tivaouane, Thiès', telephone: '+221 33 952 10 10', email: 'cst@health.sn', delivreCertificat: true },
  
  // Autres régions
  { nom: 'Hôpital Régional de Saint-Louis', code: 'HRSL-001', type: 'Hopital', region: 'ST', departement: 'ST-001', commune: null, adresse: 'Saint-Louis', telephone: '+221 33 961 10 10', email: 'hrsl@health.sn', delivreCertificat: true },
  { nom: 'Hôpital Régional de Kaolack', code: 'HRK-001', type: 'Hopital', region: 'KL', departement: 'KL-001', commune: null, adresse: 'Kaolack', telephone: '+221 33 941 10 10', email: 'hrk@health.sn', delivreCertificat: true },
  { nom: 'Hôpital Régional de Ziguinchor', code: 'HRZ-001', type: 'Hopital', region: 'ZG', departement: 'ZG-001', commune: null, adresse: 'Ziguinchor', telephone: '+221 33 991 10 10', email: 'hrz@health.sn', delivreCertificat: true },
  { nom: 'Hôpital Régional de Kolda', code: 'HRKD-001', type: 'Hopital', region: 'KD', departement: 'KD-001', commune: null, adresse: 'Kolda', telephone: '+221 33 996 10 10', email: 'hrkd@health.sn', delivreCertificat: true },
  { nom: 'Hôpital Régional de Louga', code: 'HRLG-001', type: 'Hopital', region: 'LG', departement: 'LG-001', commune: null, adresse: 'Louga', telephone: '+221 33 967 10 10', email: 'hrlg@health.sn', delivreCertificat: true },
  { nom: 'Hôpital Régional de Tambacounda', code: 'HRTC-001', type: 'Hopital', region: 'TC', departement: 'TC-001', commune: null, adresse: 'Tambacounda', telephone: '+221 33 981 10 10', email: 'hrtc@health.sn', delivreCertificat: true },
  { nom: 'Hôpital Régional de Fatick', code: 'HRF-001', type: 'Hopital', region: 'FD', departement: 'FD-001', commune: null, adresse: 'Fatick', telephone: '+221 33 949 10 10', email: 'hrf@health.sn', delivreCertificat: true },
  { nom: 'Hôpital Régional de Diourbel', code: 'HRD-001', type: 'Hopital', region: 'DB', departement: 'DB-001', commune: null, adresse: 'Diourbel', telephone: '+221 33 971 10 10', email: 'hrd@health.sn', delivreCertificat: true }
];

// Mairies principales du Sénégal (exemples réels)
const mairiesData = [
  // Dakar
  { nom: 'Mairie de Dakar', code: 'M-DK-001', type: 'Mairie', region: 'DK', departement: 'DK-001', commune: null, adresse: 'Place de l\'Indépendance, Dakar', telephone: '+221 33 839 11 11', email: 'mairie.dakar@senegal.sn' },
  { nom: 'Mairie d\'Arrondissement de Plateau', code: 'MA-DK-001', type: 'Mairie d\'Arrondissement', region: 'DK', departement: 'DK-001', commune: null, adresse: 'Plateau, Dakar', telephone: '+221 33 839 12 12', email: 'ma.plateau@senegal.sn' },
  { nom: 'Mairie d\'Arrondissement de Médina', code: 'MA-DK-002', type: 'Mairie d\'Arrondissement', region: 'DK', departement: 'DK-001', commune: null, adresse: 'Médina, Dakar', telephone: '+221 33 839 13 13', email: 'ma.medina@senegal.sn' },
  { nom: 'Mairie d\'Arrondissement de Grand Dakar', code: 'MA-DK-003', type: 'Mairie d\'Arrondissement', region: 'DK', departement: 'DK-001', commune: null, adresse: 'Grand Dakar', telephone: '+221 33 839 14 14', email: 'ma.granddakar@senegal.sn' },
  { nom: 'Mairie de Pikine', code: 'M-DK-002', type: 'Mairie', region: 'DK', departement: 'DK-003', commune: null, adresse: 'Pikine, Dakar', telephone: '+221 33 834 20 20', email: 'mairie.pikine@senegal.sn' },
  { nom: 'Mairie de Rufisque', code: 'M-DK-003', type: 'Mairie', region: 'DK', departement: 'DK-004', commune: null, adresse: 'Rufisque, Dakar', telephone: '+221 33 836 10 10', email: 'mairie.rufisque@senegal.sn' },
  { nom: 'Mairie de Guédiawaye', code: 'M-DK-004', type: 'Mairie', region: 'DK', departement: 'DK-002', commune: null, adresse: 'Guédiawaye, Dakar', telephone: '+221 33 835 10 10', email: 'mairie.guediawaye@senegal.sn' },
  
  // Thiès
  { nom: 'Mairie de Thiès', code: 'M-TH-001', type: 'Mairie', region: 'TH', departement: 'TH-001', commune: null, adresse: 'Thiès', telephone: '+221 33 951 11 11', email: 'mairie.thies@senegal.sn' },
  { nom: 'Mairie de M\'bour', code: 'M-TH-002', type: 'Mairie', region: 'TH', departement: 'TH-002', commune: null, adresse: 'M\'bour, Thiès', telephone: '+221 33 957 11 11', email: 'mairie.mbour@senegal.sn' },
  { nom: 'Mairie de Tivaouane', code: 'M-TH-003', type: 'Mairie', region: 'TH', departement: 'TH-003', commune: null, adresse: 'Tivaouane, Thiès', telephone: '+221 33 952 11 11', email: 'mairie.tivaouane@senegal.sn' },
  
  // Saint-Louis
  { nom: 'Mairie de Saint-Louis', code: 'M-ST-001', type: 'Mairie', region: 'ST', departement: 'ST-001', commune: null, adresse: 'Saint-Louis', telephone: '+221 33 961 11 11', email: 'mairie.saintlouis@senegal.sn' },
  { nom: 'Mairie de Dagana', code: 'M-ST-002', type: 'Mairie', region: 'ST', departement: 'ST-002', commune: null, adresse: 'Dagana, Saint-Louis', telephone: '+221 33 962 11 11', email: 'mairie.dagana@senegal.sn' },
  
  // Kaolack
  { nom: 'Mairie de Kaolack', code: 'M-KL-001', type: 'Mairie', region: 'KL', departement: 'KL-001', commune: null, adresse: 'Kaolack', telephone: '+221 33 941 11 11', email: 'mairie.kaolack@senegal.sn' },
  
  // Ziguinchor
  { nom: 'Mairie de Ziguinchor', code: 'M-ZG-001', type: 'Mairie', region: 'ZG', departement: 'ZG-001', commune: null, adresse: 'Ziguinchor', telephone: '+221 33 991 11 11', email: 'mairie.ziguinchor@senegal.sn' },
  
  // Kolda
  { nom: 'Mairie de Kolda', code: 'M-KD-001', type: 'Mairie', region: 'KD', departement: 'KD-001', commune: null, adresse: 'Kolda', telephone: '+221 33 996 11 11', email: 'mairie.kolda@senegal.sn' },
  
  // Louga
  { nom: 'Mairie de Louga', code: 'M-LG-001', type: 'Mairie', region: 'LG', departement: 'LG-001', commune: null, adresse: 'Louga', telephone: '+221 33 967 11 11', email: 'mairie.louga@senegal.sn' },
  
  // Tambacounda
  { nom: 'Mairie de Tambacounda', code: 'M-TC-001', type: 'Mairie', region: 'TC', departement: 'TC-001', commune: null, adresse: 'Tambacounda', telephone: '+221 33 981 11 11', email: 'mairie.tambacounda@senegal.sn' },
  
  // Fatick
  { nom: 'Mairie de Fatick', code: 'M-FD-001', type: 'Mairie', region: 'FD', departement: 'FD-001', commune: null, adresse: 'Fatick', telephone: '+221 33 949 11 11', email: 'mairie.fatick@senegal.sn' },
  
  // Diourbel
  { nom: 'Mairie de Diourbel', code: 'M-DB-001', type: 'Mairie', region: 'DB', departement: 'DB-001', commune: null, adresse: 'Diourbel', telephone: '+221 33 971 11 11', email: 'mairie.diourbel@senegal.sn' }
];

async function populateData() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Nettoyer les données existantes (optionnel - décommentez si nécessaire)
    // await Region.deleteMany({});
    // await Departement.deleteMany({});
    // await Commune.deleteMany({});
    // await CommunauteRurale.deleteMany({});
    // await Hopital.deleteMany({});

    console.log('📝 Création des régions et départements...\n');

    const regionMap = {};
    const departementMap = {};

    // Créer les régions et départements
    for (const regionData of senegalData.regions) {
      // Créer ou mettre à jour la région
      let region = await Region.findOne({ code: regionData.code });
      if (!region) {
        region = new Region({
          code: regionData.code,
          nom: regionData.nom,
          chefLieu: regionData.chefLieu,
          active: true
        });
        await region.save();
        console.log(`✅ Région créée: ${region.nom}`);
      } else {
        console.log(`ℹ️  Région existe déjà: ${region.nom}`);
      }
      regionMap[regionData.code] = region._id;

      // Créer les départements de cette région
      for (const deptData of regionData.departements) {
        let departement = await Departement.findOne({ code: deptData.code });
        if (!departement) {
          departement = new Departement({
            code: deptData.code,
            nom: deptData.nom,
            region: region._id,
            chefLieu: deptData.chefLieu,
            active: true
          });
          await departement.save();
          
          // Ajouter le département à la région
          if (!region.departements.includes(departement._id)) {
            region.departements.push(departement._id);
            await region.save();
          }
          
          console.log(`  ✅ Département créé: ${departement.nom}`);
        } else {
          console.log(`  ℹ️  Département existe déjà: ${departement.nom}`);
        }
        departementMap[deptData.code] = departement._id;
      }
    }

    console.log('\n📝 Création des hôpitaux...\n');

    // Créer les hôpitaux
    for (const hopitalData of hopitauxData) {
      const regionId = regionMap[hopitalData.region];
      const departementId = departementMap[hopitalData.departement];
      
      if (!regionId || !departementId) {
        console.log(`⚠️  Impossible de trouver région/département pour ${hopitalData.nom}`);
        continue;
      }

      let hopital = await Hopital.findOne({ code: hopitalData.code });
      if (!hopital) {
        hopital = new Hopital({
          nom: hopitalData.nom,
          code: hopitalData.code,
          type: hopitalData.type,
          region: regionId,
          departement: departementId,
          commune: hopitalData.commune || null,
          adresse: hopitalData.adresse || '',
          telephone: hopitalData.telephone,
          email: hopitalData.email,
          delivreCertificatAccouchement: hopitalData.delivreCertificat,
          active: true
        });
        await hopital.save();
        console.log(`✅ Hôpital créé: ${hopital.nom}`);
      } else {
        console.log(`ℹ️  Hôpital existe déjà: ${hopital.nom}`);
      }
    }

    console.log('\n📝 Création des communes...\n');

    // Créer des communes pour chaque département (communes principales)
    const communeMap = {};
    for (const [deptCode, deptId] of Object.entries(departementMap)) {
      // Obtenir le département pour avoir sa région
      const departement = await Departement.findById(deptId);
      if (!departement) continue;

      // Créer une commune principale pour chaque département (basée sur le chef-lieu)
      const communeCode = `C-${deptCode}`;
      let commune = await Commune.findOne({ code: communeCode });
      
      if (!commune) {
        commune = new Commune({
          code: communeCode,
          nom: departement.chefLieu || departement.nom,
          departement: deptId,
          region: departement.region,
          active: true
        });
        await commune.save();
        console.log(`  ✅ Commune créée: ${commune.nom} (${departement.nom})`);
      } else {
        console.log(`  ℹ️  Commune existe déjà: ${commune.nom}`);
      }
      communeMap[deptCode] = commune._id;

      // Ajouter la commune au département
      if (!departement.communes || !departement.communes.includes(commune._id)) {
        if (!departement.communes) {
          departement.communes = [];
        }
        departement.communes.push(commune._id);
        await departement.save();
      }
    }

    console.log('\n📝 Création des mairies...\n');

    // Créer les mairies
    for (const mairieData of mairiesData) {
      const regionId = regionMap[mairieData.region];
      const departementId = departementMap[mairieData.departement];
      const communeId = communeMap[mairieData.departement] || null;
      
      if (!regionId || !departementId) {
        console.log(`⚠️  Impossible de trouver région/département pour ${mairieData.nom}`);
        continue;
      }

      let mairie = await Mairie.findOne({ code: mairieData.code });
      if (!mairie) {
        mairie = new Mairie({
          nom: mairieData.nom,
          code: mairieData.code,
          type: mairieData.type,
          region: regionId,
          departement: departementId,
          commune: communeId || mairieData.commune || null,
          communauteRurale: mairieData.communauteRurale || null,
          adresse: mairieData.adresse || '',
          telephone: mairieData.telephone,
          email: mairieData.email,
          active: true
        });
        await mairie.save();
        console.log(`✅ Mairie créée: ${mairie.nom}`);
      } else {
        console.log(`ℹ️  Mairie existe déjà: ${mairie.nom}`);
      }
    }

    console.log('\n✅ Données géographiques du Sénégal créées avec succès !');
    console.log(`📊 ${senegalData.regions.length} régions`);
    console.log(`📊 ${Object.keys(departementMap).length} départements`);
    console.log(`📊 ${Object.keys(communeMap).length} communes`);
    console.log(`📊 ${hopitauxData.length} hôpitaux/centres de santé`);
    console.log(`📊 ${mairiesData.length} mairies\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du peuplement des données:', error);
    process.exit(1);
  }
}

populateData();


