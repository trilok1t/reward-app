const config = {
  googleScriptURL: "https://script.google.com/macros/s/AKfycbyAnXL-M-t4VxEioxmvoB-I4ZwakL3A8l_pY_U3rrfg7VPVZPRYk9GYEfE0bSSU8OIi9Q/exec",
  imgbbAPIKey: "baacb15885823b0da52db6c791339cdc" // Optional for image uploads
};

// DOM Elements
const downloadBtn = document.getElementById('downloadBtn');
const initialSection = document.getElementById('initialSection');
const formSection = document.getElementById('formSection');
const rewardForm = document.getElementById('rewardForm');
const statusMessage = document.getElementById('statusMessage');

// Show form when download button clicked
downloadBtn.addEventListener('click', (e) => {
  e.preventDefault();
  initialSection.style.display = 'none';
  formSection.style.display = 'block';
});

// Form submission
rewardForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  
  try {
    const formData = {
      name: e.target.name.value.trim(),
      phone: e.target.phone.value.trim(),
      upi: e.target.upi.value.trim(),
      screenshot: e.target.screenshot.files[0]
    };

    // Basic validation
    if (!formData.name || !/^[a-zA-Z ]+$/.test(formData.name)) {
      throw new Error('Invalid name');
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      throw new Error('Phone must be 10 digits');
    }
    if (!formData.upi.includes('@')) {
      throw new Error('Invalid UPI ID');
    }

    // Upload image if exists
    let imageUrl = '';
    if (formData.screenshot) {
      const imgForm = new FormData();
      imgForm.append('image', formData.screenshot);
      
      const imgResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${config.imgbbAPIKey}`,
        { method: 'POST', body: imgForm }
      );
      const imgData = await imgResponse.json();
      imageUrl = imgData.data?.url || '';
    }

    // Submit to Google Sheets
    const response = await fetch(config.googleScriptURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        upi: formData.upi,
        imageUrl: imageUrl || 'No screenshot'
      })
    });

    const result = await response.json();
    
    if (result.error) throw new Error(result.message);
    
    showStatus('Reward claimed successfully!', 'success');
    rewardForm.reset();
    
  } catch (error) {
    showStatus(error.message, 'error');
    console.error('Submission error:', error);
  } finally {
    submitBtn.disabled = false;
  }
});

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
  statusMessage.style.display = 'block';
  
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 5000);
}

// Test function (run in console)
window.testAPI = async () => {
  const testData = {
    name: "Test User",
    phone: "1234567890",
    upi: "test@upi"
  };
  
  try {
    const response = await fetch(config.googleScriptURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    const result = await response.json();
    console.log('Test result:', result);
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
};
