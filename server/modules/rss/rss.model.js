const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: 1,
    index: 1,
  },
  time: {
    type: String,
  }

}, { timestamps: true })

module.exports = {
  Song: mongoose.model('Song', SongSchema)
}