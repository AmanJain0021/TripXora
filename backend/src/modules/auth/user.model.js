const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: [
      function () {
        return !this.googleId;
      },
      'Please provide a password',
    ],
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  preferences: {
    defaultCurrency: {
      type: String,
      default: 'INR',
    },
    interests: {
      type: [String],
      default: [],
    },
    travelPace: {
      type: String,
      enum: ['relaxed', 'moderate', 'packed'],
      default: 'moderate',
    },
    dietaryPref: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'any'],
      default: 'any',
    },
  },
}, { timestamps: true });

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
