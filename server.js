const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

MongoClient.connect(process.env.MONGO_CONNECTION_STRING).then(client => {
  const db = client.db('pokedex-api');
  const pokemonCollection = db.collection('pokemon');

  app.get('/', (req, res) => {
    pokemonCollection.find().toArray()
      .then(result => {
          res.send(
            `<h1>There ${result.length <= 1 ? "is" : "are"} currently ${result.length} Pokemon entered into the database!</h1>
             <h3>Paths:</h3>
             <h3>GET: /pokemon - Shows all Pokemon in the Pokedex!</h3>
             <h3>GET: /pokemon/:number - Shows specific Pokemon by their number!</h3>
             <h3>GET: /pokemon/:type - Shows all Pokemon that match the provided type(s), multiple types allowed separated by a space!</h3>
             <h3>POST: /pokemon - Allows you to add a new Pokemon to the Pokedex. Must have the "No.": name: and type: properties</h3>
          `);
      })
      .catch(error => console.error(error));
  });

  app.get('/pokemon', (req, res) => {
    pokemonCollection.find().toArray()
      .then(result => {
          res.json(result);
      })
      .catch(error => console.error(error));
  });

  app.get('/pokemon/:id', (req, res) => {
    pokemonCollection.find().toArray()
      .then(result => {
        if (/^\d+$/.test(req.params.id)) {
          const pokemon = result.filter(p => p["No."] === req.params.id);
          res.json(pokemon);
        } else {
          let types = req.params.id.split(" ");
          const pokemon = result.filter(p => p.type.some(arr => types.includes(arr)));
          res.json(pokemon);
        }
      })
      .catch(error => console.error(error));
  });

  app.post('/pokemon', (req, res) => {
    const checkReq = (body) => body["No."] && body.name && body.type;

    const pokemon = {
      "No.": req.body["No."],
      "name": req.body.name,
      "type": req.body.type
    }

    if (checkReq(req.body)) {
      pokemonCollection.findOne({ name: req.body.name })
        .then(result => {
          if(result === null) {
            pokemonCollection.insertOne(pokemon)
              .then(result => {
                res.redirect('/');
              })
              .catch(err => {
                console.error(err);
              })
          } else {
            res.status(400).send('Error: This Pokemon is already in the Pokedex!');
          }
      })
    } else {
      res.status(400).send('Error: Malformed post! Please check your parameters!');
    }
  });

  app.listen(process.env.PORT || PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

