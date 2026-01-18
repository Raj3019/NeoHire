const { Resend } = require('resend')

const resend = new Resend('re_fvGyNWJ7_JFRJyPL29fzo6Q2CMr5tNgwW')

resend.emails.send({
  from:'onboard@resend.dev',
  to: 'manan3019@protonmail.com',
  subject:'Hello World 2',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
})