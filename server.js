const mongoose = require("mongoose");
const Document = require("./document");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const client = new MongoClient(
  "mongodb+srv://aswinsrinivasan2004:kingaswin999@cluster0.56fwxsp.mongodb.net/"
);

const connectDB = async () => {
  try {
    console.log("object");

    await mongoose.connect(
      "mongodb+srv://aswinsrinivasan2004:kingaswin999@cluster0.56fwxsp.mongodb.net/"
    );
    console.log("connected to db 2");

    const db = mongoose.connection;

    // Bind connection to error event (to get notifications of connection errors)
    db.on("error", console.error.bind(console, "MongoDB connection error:"));

    // Once connected
    db.once("open", function () {
      console.log("Connected successfully to MongoDB Atlas");
    });
  } catch (e) {
    console.log(e);
  }
};
connectDB();

const io = require("socket.io")(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreate(documentId);

    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (newData) => {
      await Document.findByIdAndUpdate(documentId, { data: newData });
    });
  });
  console.log("connected");
});

async function findOrCreate(id) {
  if (id == null) return;

  const doc = await Document.findById(id);
  if (doc) {
    return doc;
  }
  return await Document.create({ _id: id, data: defaultValue });
}
