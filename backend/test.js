const mongoose = require('mongoose');

const uri = "mongodb://mallikarjunhiremaths72_db_user:R44OhaZBIzKiga7k@ac-azkuuw8-shard-00-00.r4gq6fb.mongodb.net:27017,ac-azkuuw8-shard-00-01.r4gq6fb.mongodb.net:27017,ac-azkuuw8-shard-00-02.r4gq6fb.mongodb.net:27017/KrishiFlow?ssl=true&replicaSet=atlas-2y4sfs-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => { console.log('Success'); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
