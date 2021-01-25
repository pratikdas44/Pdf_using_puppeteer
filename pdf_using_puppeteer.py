const puppeteer = require('puppeteer');
const cron = require('node-cron');
const fs = require('fs');
const nodemailer = require('nodemailer');
const sendmail = (todaydate) => {
  let filename = `geckoboard_${todaydate}.pdf`;

      let transporter = nodemailer.createTransport({
          service: 'outlook',
          auth: {
              user: 'xxxx', //smtp user
              pass: 'xxxx', //smtp password
          },
      });

      let mailOptions = {
          from: 'xxxx',
          to: 'xxx',
          subject: `Weekly Report for ${todaydate}` ,
          text: `Automated email for report`,
          attachments: [{
            filename: filename,
            path: filename
            }]
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          fs.unlinkSync(filename); // delete file when successful sendmail
          console.log('Message sent: %s', info.messageId);
      });
}

(async () => {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth()+1;
  let yyyy = today.getFullYear();
  todaydate = `${dd}_${mm}_${yyyy}`;
  filename = `geckoboard_${todaydate}.pdf`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://csjira.atlassian.net/wiki/spaces/~528303054/pages/484048932/Project+Portfolio+Dashboard+-+Nikhil', { waitUntil: 'networkidle0' }); // wait until page load
  await page.type('#username', 'xxxx'); //Atlassian email id
  await Promise.all([
    page.click('#login-submit'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  await page.waitForTimeout(2000);
  await page.type('#password', 'xxxx'); //Atlassian password
  await Promise.all([
    page.click('#login-submit'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  await page.waitForTimeout(20000);
  await page.setViewport({
    width: 1000,
    height: 800,
    deviceScaleFactor: 2,
    isMobile: false
  });
  await page.pdf({
      path: filename,
      format: "A3",
      printBackground: true,
      scale: 1,
      displayHeaderFooter: false,
      margin: {                                                                                                                                                                     top: 0,
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });
  await browser.close();
  sendmail(todaydate)
})();
