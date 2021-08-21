const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const port = process.env.PORT || 7000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r1fla.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  console.log("connection err", err);
  const serviceCollection = client.db("picturesque").collection("servicees");
  const bookingsCollection = client
    .db("picturesque")
    .collection("bookings");
  const adminCollection = client.db("picturesque").collection("admins");

  console.log("database connected successfully");

  //api to add new admin
  app.post("/addAdmin", (req, res) => {
    const email = req.body;
    adminCollection.insertOne(email).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //api to check if logged user is an admin
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });

  app.post("/addService", (req, res) => {
    const newService = req.body;
    // console.log('adding new service:', newService)
    serviceCollection.insertOne(newService).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, items) => {
      // console.log(err, items);
      res.send(items);
    });
  });

  app.get("/service/:id", (req, res) => {
    serviceCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, items) => {
        console.log(err, items);
        res.send(items[0]);
      });
  });
  //  delete a service
  app.delete("/deleteService/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
      serviceCollection
        .findOneAndDelete({ _id: ObjectId(id) })
        .then((result) => {
          if (result) {
            res.json({
              success: true,
              message: "Successfully Deleted",
            });
          }
        });
    } catch (e) {
      res.json({
        success: false,
        message: e,
      });
    }
  });

  app.post("/addBooking", (req, res) => {
    const bookings = req.body;
    console.log("adding new book:", bookings);
    bookingsCollection.insertOne(bookings).then((result) => {
      // console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/booking/:id", (req, res) => {
    bookingsCollection.find({}).toArray((err, items) => {
      console.log(err, items);
      res.send(items);
    });
  });


  // all booking orders
  app.get("/bookings", (req, res) => {
    bookingsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // user booking orders
  app.get("/booking", (req, res) => {
    const email = req.query.email;
    bookingsCollection.find({ email: email }).toArray((err, documents) => {
      console.log(err, documents, email);
      res.send(documents);
    });
  });

  app.get("/secureOrder/:id", (req, res) => {
    bookingsCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, order) => {
        res.send(order);
      });
  });

  app.patch("/updateStatus", (req, res) => {
    const { id, status } = req.body;
    bookingsCollection
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: { status: status },
        }
      )
      .then((result) => res.send(result.modifiedCount > 0));
  });

  // client.close();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});