const mongoose = require("mongoose"); //Importing mongoose to define a schema and model for Mood entries

const moodSchema = new mongoose.Schema(
  {
    //Defining the schema for Mood entries
    userId: {
      //Each mood entry is associated with a user
      type: String,
      required: true,
    },
    mood: {
      //The mood value (e.g., "happy", "sad", etc.)
      type: String,
      required: true,
    },
    note: {
      //An optional note associated with the mood entry
      type: String,
      default: "",
    },
    date: {
      //The date when the mood entry was created
      type: String,
      default: Date.now,
    },
  },
  { timestamps: true } //Automatically manage createdAt and updatedAt timestamps
);

module.exports = mongoose.model("mood", moodSchema); //Exporting the Mood model based on the defined schema
