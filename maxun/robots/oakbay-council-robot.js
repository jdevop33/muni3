module.exports = {
  name: "Oak Bay Council Meeting Scraper",
  description: "Extracts meeting information from the Oak Bay CivicWeb Portal", // Updated description
  version: "1.1.1", // Incremented version
  url: "https://oakbay.civicweb.net/Portal/MeetingTypeList.aspx", // CORRECT URL

  async run(page, context) {
    console.log("Starting Oak Bay CivicWeb meeting scraper...");
    const targetUrl = "https://oakbay.civicweb.net/Portal/MeetingTypeList.aspx"; // Hardcoded URL
    try {
      // await page.goto(this.url, { waitUntil: 'networkidle0', timeout: 60000 }); // Original
      // await page.goto(this.url); // Simplified - Still failed
      await page.goto(targetUrl); // HARDCODED URL
      console.log("Navigated to page: ", targetUrl);

      // Wait for the main meeting container
      const meetingListSelector = '#MeetingList';
      console.log(`Waiting for selector: ${meetingListSelector}`);
      try {
        await page.waitForSelector(meetingListSelector, { timeout: 90000 }); // Increased wait time
        console.log(`Selector ${meetingListSelector} found.`);
      } catch (e) {
        console.error(`Failed to find selector ${meetingListSelector}. Dumping page content...`);
        try {
          const html = await page.content();
          console.error("PAGE HTML (first 5000 chars):", html.substring(0, 5000));
        } catch (dumpError) {
          console.error("Failed to dump page content:", dumpError);
        }
        throw new Error(`Selector ${meetingListSelector} not found on page.`); // Re-throw error
      }

      // Extract meeting information
      console.log("Attempting to evaluate page content...");
      const meetings = await page.evaluate((listSelector) => {
        // This console.log runs in the browser context, may not appear in Cloud Run server logs easily
        console.log(`Evaluating inside browser for selector: ${listSelector}`);
        const meetingNodes = document.querySelectorAll(`${listSelector} .MeetingRow`);
        const meetingsData = [];
        console.log(`Found ${meetingNodes.length} meeting nodes in browser.`);

        meetingNodes.forEach((node, index) => {
          try {
            const meeting = {};
            const titleElem = node.querySelector('.MeetingTitle a');
            const dateElem = node.querySelector('.MeetingDate');
            const timeElem = node.querySelector('.MeetingTime');
            const docsElem = node.querySelector('.MeetingDocuments');

            meeting.title = titleElem ? titleElem.textContent.trim() : 'Unknown Meeting Type'; // Use title directly
            const dateText = dateElem ? dateElem.textContent.trim() : null;

            // Basic date parsing (might need refinement depending on actual format)
            meeting.date = dateText ? new Date(dateText).toISOString() : new Date().toISOString();
            if (isNaN(new Date(meeting.date).getTime())) { // Check if date is valid
                 console.warn(`Invalid date parsed: ${dateText}, using current date.`);
                 meeting.date = new Date().toISOString();
            }

            meeting.type = meeting.title.includes('Regular') ? 'Regular' :
                           meeting.title.includes('Committee') ? 'Committee' :
                           meeting.title.includes('Public Hearing') ? 'Public Hearing' :
                           meeting.title.includes('Special') ? 'Special' : 'Other'; // Infer type from title

            meeting.status = 'Unknown'; // Determine later based on date/docs
            meeting.startTime = timeElem ? timeElem.textContent.trim() : null;
            meeting.duration = null; // Duration not directly available
            meeting.participants = null; // Participants not available
            meeting.topics = [meeting.type]; // Basic topic based on type for now

            meeting.documentsLinks = [];
            meeting.hasAgenda = false;
            meeting.hasMinutes = false;
            meeting.hasVideo = false;

            if (docsElem) {
                const links = docsElem.querySelectorAll('a');
                links.forEach(link => {
                    const linkText = link.textContent.trim().toLowerCase();
                    const linkUrl = link.href;
                    if (linkUrl && linkText) { // Ensure link and text exist
                      meeting.documentsLinks.push({ title: link.textContent.trim(), url: linkUrl });
                      if (linkText.includes('agenda')) meeting.hasAgenda = true;
                      if (linkText.includes('minutes')) meeting.hasMinutes = true;
                      if (linkText.includes('video')) meeting.hasVideo = true;
                    }
                });
            }

            // Refine status based on date and docs
            const now = new Date();
            const meetingDate = new Date(meeting.date);
            if (meetingDate > now) {
                meeting.status = "Upcoming";
            } else if (meeting.hasMinutes) {
                meeting.status = "Completed";
            } else {
                meeting.status = "Past (Minutes Pending)";
            }

            meetingsData.push(meeting);
          } catch (error) {
            // Log errors happening *inside* the browser context evaluation
            console.error(`Error processing meeting node ${index} in browser:`, error.message);
          }
        });

        return meetingsData;
      }, meetingListSelector);

      console.log(`Successfully evaluated page, extracted ${meetings.length} potential meetings.`);

      return meetings;

    } catch (error) {
      console.error("Error during scraping run:", error);
      // Attempt to take a screenshot on error
      try {
         const screenshotPath = `/tmp/error_screenshot_${Date.now()}.png`; // Use /tmp for Cloud Run
         await page.screenshot({ path: screenshotPath, fullPage: true });
         console.log(`Error screenshot saved to ${screenshotPath} (Note: /tmp is ephemeral)`);
      } catch (screenshotError) {
         console.error("Failed to take error screenshot:", screenshotError);
      }
      throw error; // Re-throw the original error to mark job as failed
    }
  }
};