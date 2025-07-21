// Configuration
const config = {
  googleScriptURL: "https://script.google.com/macros/s/AKfycbz7zLJgNens8knNO1k5uP3xGhKHzkl00QdXyp7ywO3xD5DPjv2vnGkh92XDpbeME_U5pA/exec", // Replace with your deployed URL (ends with /exec)
  imgbbAPIKey: "baacb15885823b0da52db6c791339cdc" // Optional - only if using image uploads
};

// DOM Elements
const rewardForm = document.getElementById("rewardForm");
const statusMessage = document.getElementById("statusMessage");

// Form Submission Handler
rewardForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Get form data
  const formData = {
    name: e.target.name.value.trim(),
    phone: e.target.phone.value.trim(),
    upi: e.target.upi.value.trim(),
    screenshot: e.target.screenshot.files[0]
  };

  // Validate inputs
  if (!formData.name || !/^[a-zA-Z ]+$/.test(formData.name)) {
    showStatus("Please enter a valid name", "error");
    return;
  }

  if (!/^\d{10}$/.test(formData.phone)) {
    showStatus("Phone number must be 10 digits", "error");
    return;
  }

  if (!formData.upi.includes("@")) {
    showStatus("Please enter a valid UPI ID", "error");
    return;
  }

  // Disable submit button during processing
  const submitBtn = e.target.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Processing...";

  try {
    // 1. Upload image if exists (optional)
    let imageUrl = "";
    if (formData.screenshot) {
      imageUrl = await uploadImage(formData.screenshot);
    }

    // 2. Send data to Google Sheets
    const response = await fetch(config.googleScriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        upi: formData.upi,
        imageUrl: imageUrl || "No screenshot"
      })
    });

    const result = await response.json();

    if (result.success) {
      showStatus("✅ Reward claimed successfully! Payment will arrive within 24 hours.", "success");
      rewardForm.reset();
    } else {
      throw new Error(result.error || "Submission failed");
    }
  } catch (error) {
    showStatus(`❌ Error: ${error.message}`, "error");
    console.error("Submission error:", error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Claim Reward";
  }
});

// Upload image to ImgBB (optional)
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${config.imgbbAPIKey}`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  return data.data?.url || "";
}

// Show status messages
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
  statusMessage.style.display = "block";

  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 5000);
}

// Initialize form (optional)
function init() {
  console.log("Reward claim system ready");
  // You can add more initialization code here
}

// Start the application
init();
