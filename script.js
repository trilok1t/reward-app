const config = {
  googleScriptURL: "https://script.google.com/macros/s/AKfycbyAnXL-M-t4VxEioxmvoB-I4ZwakL3A8l_pY_U3rrfg7VPVZPRYk9GYEfE0bSSU8OIi9Q/exec"
};

async function submitToGoogleSheets(data) {
  try {
    // Add a random parameter to prevent caching
    const url = `${config.googleScriptURL}?t=${Date.now()}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      mode: 'no-cors' // Important for CORS issues
    });

    if (!response.ok) throw new Error("Network error");
    return await response.json();
  } catch (error) {
    console.error("Submission error:", error);
    return { error: error.message };
  }
}

// Example usage:
document.getElementById("rewardForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = {
    name: e.target.name.value,
    phone: e.target.phone.value,
    upi: e.target.upi.value,
    imageUrl: "" // Add your image handling logic if needed
  };

  const result = await submitToGoogleSheets(formData);
  console.log("Submission result:", result);
  alert(result.error ? `Error: ${result.error}` : "Success!");
});
