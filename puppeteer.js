const { default: puppeteer } = require("puppeteer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

exports.generatePuppeteer = async (req, res) => {
  const { frontImageUrl, frontSvgContent } = req.body;

  if (!frontImageUrl || !frontSvgContent) {
    return res.status(400).json({ error: "Missing image or SVG content" });
  }
  try {
    // console.log(puppeteer.executablePath());
    const browser = await puppeteer.launch({
      headless: true,
      // args: ["--no-sandbox", "--disable-setuid-sandbox"],
      // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });
    // console.log(puppeteer.executablePath());

    const page = await browser.newPage();

    // Set up the HTML content with the image and SVG
    const htmlContent = `<div style="position: relative; width: 400; height: 400px;">
          <img src="${frontImageUrl}" style="width: 100%; object-fit: cover;" />
          <div style="position: absolute; top: 70px; left: 115px; width: 100%;">
            <div style="width: 25px; height: 25px">
              ${frontSvgContent}
            </div>
          </div>
        </div>`;
    await page.setContent(htmlContent);

    // Capture the screenshot of the content
    const screenshotBuffer = await page.screenshot({
      encoding: "base64",
      omitBackground: true
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
