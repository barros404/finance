// Quick script to test model loading
const path = require('path');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

try {
  const models = require(path.join(__dirname, '..', 'src', 'models'));
  console.log('Model keys:', Object.keys(models).sort());
  console.log('Loaded sequelize version:', models.Sequelize && models.Sequelize.version);
  process.exit(0);
} catch (err) {
  console.error('Error loading models:', err);
  process.exit(1);
}
