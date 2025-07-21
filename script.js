const config = {
  googleScriptURL: "https://script.google.com/macros/s/AKfycbyAnXL-M-t4VxEioxmvoB-I4ZwakL3A8l_pY_U3rrfg7VPVZPRYk9GYEfE0bSSU8OIi9Q/exec"
};

async function submitForm(data) {
  try {
    // Add timestamp to prevent caching
    const url = `${config.googleScriptURL}?t=${Date.now()}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Submission error:", error);
    throw error;
  }
}

// Form submission handler
document.getElementById("rewardForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  
  try {
    const formData = {
      name: e.target.name.value.trim(),
      phone: e.target.phone.value.trim(),
      upi: e.target.upi.value.trim(),
      imageUrl: "" // Add your image handling if needed
    };
    
    const result = await submitForm(formData);
    alert(result.success ? "Success!" : "Error: " + result.message);
  } catch (error) {
    alert("Submission failed: " + error.message);
  } finally {
    submitBtn.disabled = false;
  }
});

// Test function for console
window.testConnection = async () => {
  try {
    const testData = {
      name: "Test User",
      phone: "1234567890",
      upi: "test@upi"
    };
    
    const result = await submitForm(testData);
    console.log("Test result:", result);
    return result;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
};
