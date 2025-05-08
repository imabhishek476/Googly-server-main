const { default: puppeteer } = require("puppeteer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

exports.generatePuppeteer = async (req, res) => {
  const { frontImageUrl, frontSvgContent } = req.body;

  if (!frontImageUrl || !frontSvgContent) {
    res.status(200).json({ error: "Error capturing the design" });
  }
  try {
    // console.log(puppeteer.executablePath());
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
      // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });
    // console.log(puppeteer.executablePath());

    const page = await browser.newPage();

    await page.setViewport({ width: 400, height: 400 });
    // Set up the HTML content with the image and SVG
    const htmlContent = `<div style="position: relative; width: 400; height: 400px;">
          <img src="${frontImageUrl}" style="width: 100%; object-fit: cover;" />
          <div style="position: absolute; top: 71px; left: 115px; width: 100%;">
            <div style="width: 26px; height: 27px">
              ${frontSvgContent}
            </div>
          </div>
        </div>`;
    await page.setContent(htmlContent);

    // Capture the screenshot of the content
    const screenshotBuffer = await page.screenshot({
      encoding: "base64",
      omitBackground: true,
      clip: { x: 0, y: 0, width: 400, height: 400 }
    });
    await page.close();
    await browser.close();
    // res.set("Content-Type", "image/png");
    // res.send(imageBuffer);
    // fs.writeFileSync("./image/png", screenshotBuffer)

    res.json({ dataUrl: `data:image/png;base64,${screenshotBuffer}` });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error capturing the design", details: error.message });
  }
};

exports.downloadPdfFromHtml = async (req, res) => {
  try {
    const {html, cssString, fileName } = req.body;

    if (!html || !cssString) {
      return { error: true, msg: "Missing html or cssString in request" };
    }

    const fullHTML = `
    <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${cssString}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // for some server environments
    });
    const page = await browser.newPage();

    await page.setContent(fullHTML, { waitUntil: "networkidle0" });

    // Optional: Generate a unique filename
    const filename = fileName || `${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, "../pdfs", filename);

    // Make sure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: '20mm',
        right: '10mm',
        bottom: '20mm',
        left: '10mm',
      },
    });

    await browser.close();

    const fileBuffer = fs.readFileSync(outputPath);
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `attachment; filename=${filename}`);
    res.send(fileBuffer);

    // Clean up - delete the file after sending
    fs.unlinkSync(outputPath);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error capturing the design", details: error.message });
  }
};