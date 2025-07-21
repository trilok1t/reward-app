// Configuration
const config = {
  googleScriptURL: "https://script.google.com/macros/s/AKfycbyAnXL-M-t4VxEioxmvoB-I4ZwakL3A8l_pY_U3rrfg7VPVZPRYk9GYEfE0bSSU8OIi9Q/exec"
};

// DOM Elements
const downloadBtn = document.getElementById("downloadBtn");
const initialSection = document.getElementById("initialSection");
const formSection = document.getElementById("formSection");
const rewardForm = document.getElementById("rewardForm");
const statusMessage = document.getElementById("statusMessage");

// Initialize the app
function init() {
  // Show form when download button is clicked
  if (downloadBtn) {
    downloadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      initialSection.style.display = "none";
      formSection.style.display = "block";
    });
  }

  // Handle form submission
  if (rewardForm) {
    rewardForm.addEventListener("submit", handleFormSubmit);
  }
}

// Form submission handler
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Processing...";

  try {
    // Get form data
    const formData = {
      name: e.target.name.value.trim(),
      phone: e.target.phone.value.trim(),
      upi: e.target.upi.value.trim(),
      screenshot: e.target.screenshot?.files[0]
    };

    // Validate inputs
    validateFormData(formData);

    // Process image if exists
    let imageUrl = "";
    if (formData.screenshot) {
      imageUrl = await uploadImage(formData.screenshot);
    }

    // Submit to Google Sheets
    const result = await submitToGoogleSheets({
      name: formData.name,
      phone: formData.phone,
      upi: formData.upi,
      imageUrl: imageUrl || "No screenshot"
    });

    if (result.error) {
      throw new Error(result.message);
    }

    showStatus("✅ Reward claimed successfully!", "success");
    rewardForm.reset();

  } catch (error) {
    showStatus(`❌ Error: ${error.message}`, "error");
    console.error("Submission error:", error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Claim Reward";
  }
}

// Validate form data
function validateFormData(data) {
  if (!data.name || !/^[a-zA-Z ]+$/.test(data.name)) {
    throw new Error("Please enter a valid name");
  }

  if (!/^\d{10}$/.test(data.phone)) {
    throw new Error("Phone number must be 10 digits");
  }

  if (!data.upi.includes("@")) {
    throw new Error("Please enter a valid UPI ID");
  }
}

// Upload image to ImgBB
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=baacb15885823b0da52db6c791339cdc`,
    { method: "POST", body: formData }
  );

  const data = await response.json();
  return data.data?.url || "";
}

// Submit data to Google Sheets
async function submitToGoogleSheets(data) {
  try {
    // Add cache-buster to prevent caching issues
    const url = `${config.googleScriptURL}?t=${Date.now()}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    // Google Apps Script returns text that needs parsing
    const textData = await response.text();
    return JSON.parse(textData);
    
  } catch (error) {
    console.error("Google Sheets submission error:", error);
    return { error: error.message };
  }
}

// Show status messages
function showStatus(message, type) {
  if (!statusMessage) return;
  
  statusMessage.textContent = message;
  statusMessage.className = type;
  statusMessage.style.display = "block";

  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 5000);
}

// Test function (run in browser console)

// Start the application
init();
