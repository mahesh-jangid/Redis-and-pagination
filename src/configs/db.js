const mongoose = require("mongoose");

module.exports = () => {
  return mongoose.connect(
    "mongodb+srv://maheshJ:mahesh9000@cluster0.3yoo8.mongodb.net/Redis?retryWrites=true&w=majority"
  );
};
