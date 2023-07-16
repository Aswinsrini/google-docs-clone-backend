const mongoose = require("mongoose");
const Document = require("./document");

mongoose
  .connect("mongodb://127.0.0.1:27017/google-docs")
  .then(() => console.log("Connected to the db"))
  .catch(() => console.log("not connected to db"));

const io = require("socket.io")(3000, {
  cors: {
    origin: "https://aswin-docs-clone.onrender.com",
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
  if (doc) return doc;
  return await Document.create({ _id: id, data: defaultValue });
}
