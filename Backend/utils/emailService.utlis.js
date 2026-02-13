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

const sendStatusChangeEmail = async (email, fullName, newStatus) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const statusMessages = {
    Suspended: {
      subject: "Account Suspended - NeoHire",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e74c3c;">Account Suspended</h2>
          <p>Dear ${fullName || 'User'},</p>
          <p>Your NeoHire account associated with <strong>${email}</strong> has been <strong>suspended</strong>.</p>
          <p>While your account is suspended, you will not be able to:</p>
          <ul>
            <li>Log in to your account</li>
            <li>Apply for jobs or post job listings</li>
            <li>Access any platform features</li>
          </ul>
          <p>If you believe this was done in error, please contact our support team at <a href="mailto:support@neohire.com">support@neohire.com</a>.</p>
          <p>Regards,<br/>The NeoHire Team</p>
        </div>
      `
    },
    Banned: {
      subject: "Account Permanently Banned - NeoHire",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #c0392b;">Account Permanently Banned</h2>
          <p>Dear ${fullName || 'User'},</p>
          <p>Your NeoHire account associated with <strong>${email}</strong> has been <strong>permanently banned</strong>.</p>
          <p>This action is final. You will no longer be able to access any NeoHire services with this account.</p>
          <p>If you believe this was done in error, please contact our support team at <a href="mailto:support@neohire.com">support@neohire.com</a>.</p>
          <p>Regards,<br/>The NeoHire Team</p>
        </div>
      `
    },
    Active: {
      subject: "Account Reactivated - NeoHire",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #27ae60;">Account Reactivated</h2>
          <p>Dear ${fullName || 'User'},</p>
          <p>Great news! Your NeoHire account associated with <strong>${email}</strong> has been <strong>reactivated</strong>.</p>
          <p>You can now log in and use all platform features as before.</p>
          <p>Welcome back!</p>
          <p>Regards,<br/>The NeoHire Team</p>
        </div>
      `
    }
  };

  const emailContent = statusMessages[newStatus];
  if (!emailContent) return;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "NeoHire <noreply@neohire.com>",
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    });
  } catch (error) {
    console.error("Failed to send status change email:", error);
    // Don't throw — email failure shouldn't block the status update
  }
};

module.exports = {sendVerificationEmail, sendStatusChangeEmail}