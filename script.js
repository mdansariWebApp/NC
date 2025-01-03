// Airtable API Configuration
const AIRTABLE_API_KEY = 'patX7tg5Rowz5M5pb.67c6938801b06a389d06ef77e1f786d1769d380d9c9cdf4aa3c13bfea2b6387a';
const AIRTABLE_BASE_ID = 'appKVv7EjD3gSMRnp';
const AIRTABLE_TABLE_NAME = 'NumerologyResults'; // Table for Destiny, Soul, and Personality Number Combinations
const AIRTABLE_BIRTHDAY_TABLE = 'BirthdayNumbers'; // Table for Birthday Numbers
const AIRTABLE_LIFE_PATH_TABLE = 'LifePathNumbers'; // Table for Life Path Numbers

// Calculate Button Click Event

// Create loading bar and popup message elements
const loadingBar = document.createElement('div');
loadingBar.id = 'loading-bar';
document.body.appendChild(loadingBar);

const popupMessage = document.createElement('div');
popupMessage.id = 'popup-message';
popupMessage.textContent = 'Please wait a few seconds...';
document.body.appendChild(popupMessage);

// CSS styles for loading bar and popup message
const styles = `
  #loading-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    width: 0;
    background-color: #00796b;
    transition: width 0.4s ease;
    z-index: 1000;
  }
  #popup-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 16px;
    text-align: center;
    display: none;
    z-index: 1001;
  }
`;
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Show loading bar and popup
function showLoading() {
  loadingBar.style.width = '100%';
  popupMessage.style.display = 'block';
}

// Hide loading bar and popup
function hideLoading() {
  setTimeout(() => {
    loadingBar.style.width = '0';
    popupMessage.style.display = 'none';
  }, 500); // Small delay for smooth transition
}

document.getElementById('calculate-btn').addEventListener('click', async function () {
  const name = document.getElementById('name').value.trim();
  const dob = document.getElementById('dob').value;

  if (!name || !dob) {
    alert('Please enter your full name and date of birth.');
    return;
  }

  showLoading(); // Show loading bar and popup

  try {
    // Perform your calculations and data fetching
    const destinyNumber = reduceToSingleDigit(calculateDestinyNumber(name));
    const soulNumber = calculateSoulNumber(name);
    const personalityNumber = calculatePersonalityNumber(name);
    const birthdayNumber = calculateBirthdayNumber(dob);
    const lifePathNumber = reduceToSingleDigit(calculateLifePathNumber(dob));

    updateResult('destiny-number', destinyNumber);
    updateResult('soul-number', soulNumber);
    updateResult('personality-number', personalityNumber);
    updateResult('birthday-number', birthdayNumber);
    updateResult('life-path-number', lifePathNumber);

    await fetchCombinationResults(destinyNumber, soulNumber, personalityNumber);
    await fetchBirthdayNumberData(birthdayNumber);
    await fetchLifePathNumberData(lifePathNumber);
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while processing your request.');
  } finally {
    hideLoading(); // Hide loading bar and popup after everything is done
  }
});
document.getElementById('calculate-btn').addEventListener('click', async function() {
  const name = document.getElementById('name').value.trim();
  const dob = document.getElementById('dob').value;

  if (!name || !dob) {
    alert('Please enter your full name and date of birth.');
    return;
  }

  // Perform Calculations
  const destinyNumber = reduceToSingleDigit(calculateDestinyNumber(name));
  const soulNumber = calculateSoulNumber(name);
  const personalityNumber = calculatePersonalityNumber(name);
  const birthdayNumber = calculateBirthdayNumber(dob);
  const lifePathNumber = reduceToSingleDigit(calculateLifePathNumber(dob));

  // Display Basic Numbers
  updateResult('destiny-number', destinyNumber);
  updateResult('soul-number', soulNumber);
  updateResult('personality-number', personalityNumber);
  updateResult('birthday-number', birthdayNumber);
  updateResult('life-path-number', lifePathNumber);

  // Fetch Combination Results
  await fetchCombinationResults(destinyNumber, soulNumber, personalityNumber);

  // Fetch Birthday Number Description
  await fetchBirthdayNumberData(birthdayNumber);

  // Fetch Life Path Number Description
  await fetchLifePathNumberData(lifePathNumber);
});

// Fetch Combination Results from Airtable
async function fetchCombinationResults(destiny, soul, personality) {
  const combination = `${destiny}-${soul}-${personality}`;
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={Combination}="${combination}"`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.records.length > 0) {
        const description = data.records[0].fields['Result Description'];
        document.getElementById('combination-description').textContent = description;
      } else {
        document.getElementById('combination-description').textContent = 'No result found for this combination.';
      }
    } else {
      console.error('Airtable Error:', response.statusText);
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    document.getElementById('combination-description').textContent = 'Error fetching data.';
  }
}

// Fetch Birthday Number Results from Airtable
async function fetchBirthdayNumberData(birthdayNumber) {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_BIRTHDAY_TABLE}?filterByFormula={Birthday Number}=${birthdayNumber}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.records.length > 0) {
        const description = data.records[0].fields['Description'];
        document.getElementById('birthday-description').textContent = description;
      } else {
        document.getElementById('birthday-description').textContent = 'No result found for this birthday number.';
      }
    } else {
      console.error('Airtable Error:', response.statusText);
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    document.getElementById('birthday-description').textContent = 'Error fetching data.';
  }
}

// Fetch Life Path Number Results from Airtable
async function fetchLifePathNumberData(lifePathNumber) {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_LIFE_PATH_TABLE}?filterByFormula={Life Path Number}=${lifePathNumber}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.records.length > 0) {
        const description = data.records[0].fields['Description'];
        document.getElementById('life-path-description').textContent = description;
      } else {
        document.getElementById('life-path-description').textContent = 'No result found for this life path number.';
      }
    } else {
      console.error('Airtable Error:', response.statusText);
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    document.getElementById('life-path-description').textContent = 'Error fetching data.';
  }
}

// Update Result in the DOM
function updateResult(elementId, value) {
  document.getElementById(elementId).textContent = value;
}

// Numerology Calculation Functions
function calculateDestinyNumber(name) {
  return getLetterSum(name);
}

function calculateSoulNumber(name) {
  const vowels = 'AEIOU';
  const vowelSum = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .filter(char => vowels.includes(char))
    .map(char => char.charCodeAt(0) - 64)
    .reduce((sum, value) => sum + value, 0);
  return reduceToSingleDigit(vowelSum);
}

function calculatePersonalityNumber(name) {
  const vowels = 'AEIOU';
  const consonantSum = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .filter(char => !vowels.includes(char))
    .map(char => char.charCodeAt(0) - 64)
    .reduce((sum, value) => sum + value, 0);
  return reduceToSingleDigit(consonantSum);
}

function calculateBirthdayNumber(dob) {
  const day = parseInt(dob.split('-')[2], 10); // Extracting the day of the birthday
  return reduceToSingleDigit(day); // Reducing the day to a single digit
}

function calculateLifePathNumber(dob) {
  const digits = dob.replace(/-/g, '').split('').map(Number);
  return digits.reduce((sum, value) => sum + value, 0);
}

function getLetterSum(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .map(char => char.charCodeAt(0) - 64)
    .reduce((sum, value) => sum + value, 0);
}

function reduceToSingleDigit(num) {
  while (num > 9) {
    num = num
      .toString()
      .split('')
      .map(Number)
      .reduce((sum, digit) => sum + digit, 0);
  }
  return num;
}

 // Clear Data Button Functionality
 document.getElementById('clear-btn').addEventListener('click', () => {
   document.getElementById('name').value = '';
   document.getElementById('dob').value = '';
   document.getElementById('destiny-number').textContent = '';
   document.getElementById('soul-number').textContent = '';
   document.getElementById('personality-number').textContent = '';
   document.getElementById('combination-description').textContent = '';
   document.getElementById('birthday-number').textContent = '';
   document.getElementById('birthday-description').textContent = '';
   document.getElementById('life-path-number').textContent = '';
   document.getElementById('life-path-description').textContent = '';
   document.getElementById('name').focus();
 });
 
 // Show the intro message when the page loads
window.onload = function() {
  const introMessage = document.getElementById('intro-message');

  // Add bounce animation after the message fades in
  setTimeout(() => {
    introMessage.classList.add('bounce');
  }, 3000);

  // Remove the intro message after a delay
  setTimeout(() => {
    introMessage.style.display = 'none';
  }, 10000); // Message will disappear after 10 seconds
};

// Dark Mode Toggle Functionality
document.getElementById('dark-mode-toggle').addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');

  // Change button text based on mode
  if (document.body.classList.contains('dark-mode')) {
    document.getElementById('dark-mode-toggle').textContent = '🌞Light Mode';
  } else {
    document.getElementById('dark-mode-toggle').textContent = '🌚Dark Mode';
  }
});

document.getElementById('calculate-btn').addEventListener('click', () => {
  document.getElementById('button-click-sound').play();
  // Other code for calculation
});
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
  document.getElementById('light/Dark Mode').play();
  // Other code for calculation
});

document.getElementById('clear-btn').addEventListener('click', () => {
  document.getElementById('button-click-sound').play();
  // Other code for calculation
});

document.getElementById('share-btn').addEventListener('click', function() {
  const { jsPDF } = window.jspdf; // Access jsPDF

  // Create a new jsPDF instance
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Numerology Results', 10, 10);

  // Add Combination Results Section to PDF
  const combinationDescription = document.getElementById('combination-description').textContent;
  doc.setFontSize(14);
  doc.text('Combination Results:', 10, 20);
  doc.setFontSize(12);
  doc.text(combinationDescription || 'No combination result found', 10, 30);

  // Add Birthday Number Section to PDF
  const birthdayDescription = document.getElementById('birthday-description').textContent;
  doc.setFontSize(14);
  doc.text('Birthday Number Description:', 10, 40);
  doc.setFontSize(12);
  doc.text(birthdayDescription || 'No birthday result found', 10, 50);

  // Add Life Path Number Section to PDF
  const lifePathDescription = document.getElementById('life-path-description').textContent;
  doc.setFontSize(14);
  doc.text('Life Path Number Description:', 10, 60);
  doc.setFontSize(12);
  doc.text(lifePathDescription || 'No life path result found', 10, 70);

  // Save the PDF as a Blob
  const pdfBlob = doc.output('blob');

  // Check if the Web Share API is available (for mobile devices)
  if (navigator.share) {
    // If Web Share API is supported, attempt to share the PDF on mobile
    navigator.share({
      title: 'Numerology Results',
      text: 'Check out my Numerology Results!',
      files: [new File([pdfBlob], 'numerology-results.pdf', { type: 'application/pdf' })]
    }).then(() => {
      console.log('Shared successfully');
    }).catch((error) => {
      console.error('Error sharing:', error);
    });
  } else {
    // For desktop, allow the user to download the PDF
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(pdfBlob);
    downloadLink.download = 'numerology-results.pdf'; // File name
    downloadLink.click(); // Trigger download
  }
});

// Show About Us Section
document.getElementById('about-us-btn').addEventListener('click', function() {
  document.getElementById('about-us-section').style.display = 'block';
});

// Close About Us Section
document.getElementById('close-about-us-btn').addEventListener('click', function() {
  document.getElementById('about-us-section').style.display = 'none';
});
