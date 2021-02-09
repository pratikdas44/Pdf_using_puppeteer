auth_string = "admin:airvana"
const auth_header = 'Basic ' + new Buffer.from(auth_string).toString('base64');
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const fs = require('fs');
const nodemailer = require('nodemailer');
const width_px = 1200;
const sendmail = () => {
  let filename = `Dashboard.pdf`;
  let currentdate = new Date();
  let todaydate = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/"  + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinute$
      let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: 'pratikdasbaghel@gmail.com', //smtp user
              pass: 'Pratik123@', //smtp password
          },
      });

      let mailOptions = {
          from: 'pratikdasbaghel@gmail.com',
          to: 'pratikdasbaghel@gmail.com',
          subject: `Report for ${todaydate}` ,
          text: `Grafana Dashboard`,
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
  // let currentdate = new Date();
  //todaydate = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/"  + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
  filename = `Dashboard.pdf`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Authorization': auth_header });
 // await page.setDefaultNavigationTimeout(60000);
  await page.goto('http://localhost:3000/d/c9VWsIbGz/', { waitUntil: 'networkidle0' }); // wait until page load
  await page.waitForTimeout(50000);
  await page.evaluate(() => {
      let infoCorners = document.getElementsByClassName('panel-info-corner');
      for (el of infoCorners) { el.hidden = true; };
      let resizeHandles = document.getElementsByClassName('react-resizable-handle');
      for (el of resizeHandles) { el.hidden = true; };
    });

  var height_px = await page.evaluate(() => {
      return document.getElementsByClassName('react-grid-layout')[0].getBoundingClientRect().bottom;
    }) + 20;

  async function autoScroll(page) {
      await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var height_px = document.getElementsByClassName('react-grid-layout')[0].getBoundingClientRect().bottom;
          var timer = setInterval(() => {
            var scrollHeight = height_px;

            var element = document.querySelector('.view');
            // element.scrollBy(0, distance);
            element.scrollBy({
              top: distance,
              left: 0,
              behavior: 'smooth'
            });

            totalHeight += distance;

            console.log('totalHeight', totalHeight)

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 300);
        });
      });
    }
  await autoScroll(page);
  await page.waitForTimeout(50000);
  await page.pdf({
      path: filename,
      width: width_px + 'px',
      height: height_px + 'px',
      //format: "A3",
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
  sendmail()
})();
