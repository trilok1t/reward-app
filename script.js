// Configuration
const config = {
  imgbbAPIKey: "baacb15885823b0da52db6c791339cdc",
  googleScriptURL: "YOUR_GOOGLE_SCRIPT_URL_HERE",
  secretKey: "your_secret_key_123"
};

// DOM Elements
const downloadBtn = document.getElementById("downloadBtn");
const formSection = document.getElementById("formSection");
const rewardForm = document.getElementById("rewardForm");
const initialSection = document.getElementById("initialSection");
const statusMessage = document.getElementById("statusMessage");

// Event Listeners
downloadBtn.addEventListener("click", () => {
  initialSection.style.display = "none";
  formSection.style.display = "block";
});

rewardForm.addEventListener("submit", async function(e) {
  e.preventDefault();
  
  // Get form values
  const name = this.name.value.trim();
  const phone = this.phone.value.trim();
  const upi = this.upi.value.trim();
  const screenshotFile = this.screenshot.files[0];
  
  // Validate inputs
  if (!/^[a-zA-Z ]+$/.test(name)) {
    showStatus("Please enter a valid name", "error");
    return;
  }
  
  if (!/^\d{10}$/.test(phone)) {
    showStatus("Phone number must be 10 digits", "error");
    return;
  }
  
  if (!upi.includes("@") || upi.length < 5) {
    showStatus("Please enter a valid UPI ID", "error");
    return;
  }
  
  if (!screenshotFile) {
    showStatus("Please upload a screenshot", "error");
    return;
  }
  
  // Disable submit button during processing
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Processing...";
  
  try {
    // Step 1: Upload image to ImgBB
    const imageUrl = await uploadImage(screenshotFile);
    
    // Step 2: Send data to Google Sheets
    const response = await sendToGoogleSheets(name, phone, upi, imageUrl);
    
    if (response.success) {
      showStatus("✅ Reward claim submitted! You'll receive payment within 24 hours.", "success");
      rewardForm.reset();
    } else {
      throw new Error(response.error || "Submission failed");
    }
  } catch (error) {
    console.error("Error:", error);
    showStatus(`❌ Error: ${error.message}`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Claim Reward";
  }
});

// Helper Functions
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${config.imgbbAPIKey}`, {
    method: "POST",
    body: formData
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error("Image upload failed");
  }
  
  return data.data.url;
}

async function sendToGoogleSheets(name, phone, upi, imageUrl) {
  const payload = {
    name,
    phone,
    upi,
    imageUrl,
    secret: config.secretKey
  };
  
  const response = await fetch(config.googleScriptURL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    }
  });
  
  return await response.json();
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
  statusMessage.style.display = "block";
  
  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 5000);
}
