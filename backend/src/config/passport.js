const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../modules/auth/user.model');

const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:5000/api/auth/google/callback';

  if (clientID && clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const googleId = profile.id;
            const email =
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : null;
            const name =
              profile.displayName ||
              profile.name?.givenName ||
              'Google User';
            const avatar =
              profile.photos && profile.photos[0]
                ? profile.photos[0].value
                : '';

            if (!email) {
              return done(
                new Error('Google account does not provide an email address'),
                null
              );
            }

            // 1. Check if user exists by googleId
            let user = await User.findOne({ googleId });
            if (user) {
              return done(null, user);
            }

            // 2. Check if user exists by email
            user = await User.findOne({ email });
            if (user) {
              // Link googleId to existing user without changing existing password
              user.googleId = googleId;
              if (!user.avatar && avatar) {
                user.avatar = avatar;
              }
              await user.save();
              return done(null, user);
            }

            // 3. User does not exist, create new Google user
            user = await User.create({
              name,
              email,
              googleId,
              avatar,
            });

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  } else {
    console.warn(
      'Google OAuth warning: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from environment.'
    );
  }
};

module.exports = configurePassport;
