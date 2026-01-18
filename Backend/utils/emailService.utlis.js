const {Resend} = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const sendVerificationEmail = async (to, verificationLink, userName) => {
  try {
    const {data, error} = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject: 'Verify Your NeoHire Account',
      template: {
        id: "c90e4809-6f4f-464e-b9f4-d78363cdec7d",
        variables: {
          userName: userName,
          verificationLink: verificationLink,
        },
      },
    })

    if (error) {
      console.error('Resend Error: ', error);
      throw new Error('Failed to send verification email')
    }
    // console.log('Verification email send: ', data);
    return {success: true, data}
  } catch (error) {
    // console.error('Email sending error: ', error);
    throw error
  }
}

module.exports = {sendVerificationEmail}