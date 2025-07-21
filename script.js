const imgbbAPIKey = "baacb15885823b0da52db6c791339cdc";
const sheetScriptURL = "https://script.google.com/macros/s/AKfycbzNKkZIIPbanC7lu_9bzvkPZ3V2W3oyilfgU2HBMeWFV-gq8LbaPQIKEwDHkhmAbmAyrA/exec";

document.getElementById("downloadBtn").addEventListener("click", () => {
  document.getElementById("formSection").style.display = "block";
});

document.getElementById("rewardForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = this.name.value.trim();
  const phone = this.phone.value.trim();
  const upi = this.upi.value.trim();
  const screenshotFile = this.screenshot.files[0];

  if (!/^\d{10}$/.test(phone)) {
    alert("❌ Phone number must be 10 digits.");
    return;
  }

  if (!upi.includes("@")) {
    alert("❌ UPI ID must contain @.");
    return;
  }

  if (!screenshotFile) {
    alert("❌ Please upload a screenshot.");
    return;
  }

  const formData = new FormData();
  formData.append("image", screenshotFile);

  try {
    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`, {
      method: "POST",
      body: formData
    });
    const imgbbData = await imgbbRes.json();
    const imageUrl = imgbbData.data.url;

    const body = {
      name,
      phone,
      upi,
      imageUrl
    };

    await fetch(sheetScriptURL, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    });

    alert("✅ Reward request submitted. You’ll be credited in 24 hours.");
    this.reset();
  } catch (error) {
    alert("❌ Submission failed. Please try again later.");
    console.error(error);
  }
});
