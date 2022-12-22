import nodemailer from 'nodemailer'
import Logging from '../libraries/logging.js'

export const sendEmail = async (subject, message, sendTo, sentFrom, replyTo) => {
  // Create email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: { rejectUnauthorized: false }
  })

  transporter.verify(function (error, success) {
    if (error) {
      Logging.error(error)
    } else {
      Logging.info('Server is ready to take our messages')
    }
  })

  // Option for sending email
  const options = {
    from: sentFrom,
    to: sendTo,
    replyTo: replyTo,
    subject: subject,
    html: message
  }

  // Send email
  transporter.sendMail(options, function (err, info) {
    err ? Logging.error(err) : Logging.info('Email sent.')
  })
}
