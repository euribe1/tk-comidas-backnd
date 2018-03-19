const nodemailer = require('nodemailer');

const config = require('./Config.js');
const bodyEmail = require('./bodyEmail');

const transConfig = {
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.password
    }
};

const sendUpdatePassword = (req, res) => {
    const data = req.body;
    const transporter = nodemailer.createTransport(transConfig);
    const body = bodyEmail.getBodyEmailChangePsw(data);

    const mailOptions = {
        from: `"TektonLabs 😋" <${config.smtp.user}>`,
        to: data.email,
        subject: 'Welcome to TKComidas! 🍽️ Update Your Password',
        html: body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send({ sent: false });
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.status(200).send({ sent: true });
    });
};

module.exports = { sendUpdatePassword };