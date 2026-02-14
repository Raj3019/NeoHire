const { betterAuth } = require("better-auth")
const { mongodbAdapter } = require("better-auth/adapters/mongodb")
const { MongoClient } = require("mongodb")
const { Resend } = require("resend")
const Employee = require("../model/employee.model")
const Recruiter = require("../model/recruiter.model")

const client = new MongoClient(process.env.MONGODB_URL)
const resend = new Resend(process.env.RESEND_API_KEY)

const auth = betterAuth({
  database: mongodbAdapter(client.db()),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoHashPassword: true,
    requireEmailVerification: true
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        // Replace the default callbackURL with the frontend URL
        const frontendCallback = `${process.env.FRONTEND_URL || "http://localhost:3001"}/auth/email-verified`;
        const modifiedUrl = url.replace(/callbackURL=[^&]*/, `callbackURL=${encodeURIComponent(frontendCallback)}`);

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: [user.email],
          subject: 'Verify Your NeoHire Account',
          template: {
            id: "c90e4809-6f4f-464e-b9f4-d78363cdec7d",
            variables: {
              userName: user.fullName,
              verificationLink: modifiedUrl,
            },
          },
        })

        if (error) {
          console.error('Resend Error: ', error);
          throw new Error('Failed to send verification email')
        }
        // console.log('Verification email send: ', data);
        return { success: true, data }
      } catch (error) {
        // console.error('Email sending error: ', error);
        throw error
      }
    },
    sendOnSignUp: true
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,

    cookie: {
      name: "neohire_session",
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      httpOnly: true
    }
  },

  advanced: {
    ipAddress: {
      ipv6Subnet: 64,
    }
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 50,

    customRules: {
      "/sign-up/email": {
        window: 300,
        max: 5
      },
      "/sign-up/email": {
        window: 3600,
        max: 3
      },
    }
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "Employee",
        input: true
      },
      fullName: {
        type: "string",
        required: false,
        input: true
      }
    }
  },

  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3001",
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // Create Employee or Recruiter profile based on user.role
            // better-auth uses 'name' for the display name, but we might also have 'fullName'
            const profileName = user.name || user.fullName || '';

            if (user.role === 'Employee') {
              await Employee.create({ betterAuthUserId: user.id, email: user.email, fullName: profileName, profilePicture: user.profilePicture || user.image || "", status: "Active" })
            } else if (user.role === 'Recruiter') {
              await Recruiter.create({ betterAuthUserId: user.id, email: user.email, fullName: profileName, profilePicture: user.profilePicture || user.image || "", status: "Active" })
            }
            // If no role is set (e.g. Google OAuth), skip profile creation here.
            // The /api/auth/set-role endpoint will handle it after the OAuth callback.
          } catch (error) {
            console.error("Profile creation failed:", error);
            throw error
          }
        }
      }
    }
  }
})

module.exports = { auth, client }