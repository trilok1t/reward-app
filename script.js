document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const upi = form.upi.value.trim();
    const file = form.screenshot.files[0];

    if (!name || !phone.match(/^\d{10}$/) || !upi.includes("@") || !file) {
      alert("Please fill all fields correctly and upload a valid screenshot.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    // Upload to ImgBB
    try {
      const imgbbRes = await fetch("https://api.imgbb.com/1/upload?key=baacb15885823b0da52db6c791339cdc", {
        method: "POST",
        body: formData,
      });

      const imgbbData = await imgbbRes.json();
      const imageUrl = imgbbData.data.url;

      // Send to Google Apps Script
      const response = await fetch("https://script.google.com/macros/s/AKfycbzNKkZIIPbanC7lu_9bzvkPZ3V2W3oyilfgU2HBMeWFV-gq8LbaPQIKEwDHkhmAbmAyrA/exec", {
        method: "POST",
        body: JSON.stringify({ name, phone, upi, imageUrl }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.text();
      alert("Reward request submitted. You’ll be credited in 24 hours.");
      form.reset();
    } catch (error) {
      console.error("Error:", error);
      alert("Submission failed. Please try again.");
    }
  });
});
