const mongoose = require('mongoose');
require('dotenv').config();

const Centre = require('./models/Centre');
const Farmer = require('./models/Farmer');
const Token = require('./models/Token');

const seedData = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing existing data...');
    await Centre.deleteMany({});
    await Token.deleteMany({});
    await Farmer.deleteMany({});

    console.log('🌱 Seeding Realistic Karnataka APMC Centres...');
    const centres = [
      {
        name: 'Belagavi Central APMC',
        location: { lat: 15.8497, lng: 74.4977 },
        totalCapacity: 300,
        currentLoad: 120,
        avgProcessingTimeMinutes: 12,
        isActive: true
      },
      {
        name: 'Bailhongal APMC Yard',
        location: { lat: 15.8152, lng: 74.8560 },
        totalCapacity: 150,
        currentLoad: 145, // Almost full
        avgProcessingTimeMinutes: 18,
        isActive: true
      },
      {
        name: 'Hubballi Amargol APMC',
        location: { lat: 15.3850, lng: 75.1150 },
        totalCapacity: 500,
        currentLoad: 210,
        avgProcessingTimeMinutes: 10,
        isActive: true
      },
      {
        name: 'Dharwad Krishi Utpanna Marukatte',
        location: { lat: 15.4589, lng: 75.0078 },
        totalCapacity: 200,
        currentLoad: 45,
        avgProcessingTimeMinutes: 15,
        isActive: true
      },
      {
        name: 'Gokak APMC Market',
        location: { lat: 16.1667, lng: 74.8333 },
        totalCapacity: 180,
        currentLoad: 90,
        avgProcessingTimeMinutes: 20,
        isActive: true
      },
      {
        name: 'Saundatti APMC',
        location: { lat: 15.7833, lng: 75.1167 },
        totalCapacity: 100,
        currentLoad: 25,
        avgProcessingTimeMinutes: 15,
        isActive: true
      }
    ];

    const insertedCentres = await Centre.insertMany(centres);
    console.log(`✅ Seeded ${insertedCentres.length} Centres`);

    console.log('🌱 Seeding a Dummy Farmer & Tokens...');
    const dummyFarmer = await Farmer.create({
      phone: '+919876543210',
      name: 'Ramesh',
      village: 'Kittur',
      verified: true
    });

    // Create some active queue tokens for Bailhongal APMC
    const targetCentre = insertedCentres[0];
    const tokens = Array.from({ length: 12 }).map((_, i) => ({
      farmerId: dummyFarmer._id,
      centreId: targetCentre._id,
      tokenNumber: i + 1,
      status: i < 5 ? 'completed' : i === 5 ? 'processing' : 'waiting'
    }));

    await Token.insertMany(tokens);
    console.log('✅ Seeded active queue for', targetCentre.name);

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
