import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@noir-lang/backend_barretenberg';

// Import the compiled circuit
import circuit from '../../circuits/age_verification/target/age_verification.json';

console.log('Age Verification dApp loading...');
console.log('Circuit loaded:', circuit ? 'yes' : 'no');

// Global variables
let noir = null;
let backend = null;
let generatedProof = null;
let publicInputs = null;

// Initialize the application
async function init() {
  console.log('Initializing application...');
  
  // Set max date for birth date input to today
  const birthDateInput = document.getElementById('birth-date');
  const today = new Date().toISOString().split('T')[0];
  birthDateInput.max = today;

  // Setup form submission
  const form = document.getElementById('verification-form');
  form.addEventListener('submit', handleFormSubmit);

  // Setup verify button
  const verifyBtn = document.getElementById('verify-btn');
  verifyBtn.addEventListener('click', handleVerify);

  // Initialize Noir and backend
  showLoading('Initializing Noir circuit...');
  try {
    console.log('Creating backend...');
    backend = new UltraHonkBackend(circuit);
    console.log('Backend created, creating Noir instance...');
    noir = new Noir(circuit);
    hideLoading();
    console.log('Noir initialized successfully');
  } catch (error) {
    hideLoading();
    console.error('Failed to initialize Noir:', error);
    showError('Failed to initialize the zero-knowledge circuit. Please refresh the page.');
  }
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  const birthDateStr = document.getElementById('birth-date').value;
  const minAge = parseInt(document.getElementById('min-age').value, 10);

  if (!birthDateStr) {
    showResult(false, 'Please enter your birth date.');
    return;
  }

  // Parse birth date
  const birthDate = new Date(birthDateStr);
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth() + 1; // JavaScript months are 0-indexed
  const birthDay = birthDate.getDate();

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // Prepare inputs for the circuit
  const inputs = {
    birth_year: birthYear,
    birth_month: birthMonth,
    birth_day: birthDay,
    current_year: currentYear,
    current_month: currentMonth,
    current_day: currentDay,
    min_age: minAge,
  };

  console.log('Generating proof with inputs:', {
    ...inputs,
    birth_year: '***', // Don't log private data
    birth_month: '***',
    birth_day: '***',
  });

  // Generate the proof
  showLoading('Generating zero-knowledge proof... This may take a moment.');
  
  const generateBtn = document.getElementById('generate-btn');
  generateBtn.disabled = true;

  try {
    // Generate witness and proof
    const { witness } = await noir.execute(inputs);
    generatedProof = await backend.generateProof(witness);
    
    // Extract public inputs for display
    publicInputs = {
      current_year: currentYear,
      current_month: currentMonth,
      current_day: currentDay,
      min_age: minAge,
    };

    hideLoading();
    generateBtn.disabled = false;

    // Show success result
    showResult(true, `Proof generated successfully! You have proven that you are at least ${minAge} years old.`);
    showProof();

  } catch (error) {
    hideLoading();
    generateBtn.disabled = false;
    console.error('Proof generation failed:', error);
    
    // Check if the error is due to age constraint
    if (error.message && error.message.includes('assert')) {
      showResult(false, `Age verification failed. You must be at least ${minAge} years old.`);
    } else if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('network'))) {
      showResult(false, 'Network error: Unable to download cryptographic setup data. Please check your internet connection and try again.');
    } else {
      showResult(false, 'Failed to generate proof. Please check your inputs and try again.');
    }
    
    hideProof();
  }
}

// Handle proof verification
async function handleVerify() {
  if (!generatedProof) {
    alert('No proof to verify. Please generate a proof first.');
    return;
  }

  const verifyBtn = document.getElementById('verify-btn');
  const verifyResult = document.getElementById('verify-result');
  
  verifyBtn.disabled = true;
  showLoading('Verifying proof...');

  try {
    const isValid = await backend.verifyProof(generatedProof);
    
    hideLoading();
    verifyBtn.disabled = false;
    verifyResult.style.display = 'block';

    if (isValid) {
      verifyResult.className = 'success';
      verifyResult.innerHTML = '✅ <strong>Proof verified successfully!</strong><br>The proof is valid and confirms the age requirement.';
    } else {
      verifyResult.className = 'error';
      verifyResult.innerHTML = '❌ <strong>Proof verification failed!</strong><br>The proof is invalid.';
    }
  } catch (error) {
    hideLoading();
    verifyBtn.disabled = false;
    verifyResult.style.display = 'block';
    verifyResult.className = 'error';
    verifyResult.innerHTML = '❌ <strong>Verification error:</strong><br>' + error.message;
  }
}

// Show verification result
function showResult(success, message) {
  const resultSection = document.getElementById('result-section');
  const resultContent = document.getElementById('result-content');
  
  resultSection.style.display = 'block';
  
  if (success) {
    resultContent.innerHTML = `
      <div class="result-success">
        <h3>✅ Verification Successful</h3>
        <p>${message}</p>
      </div>
    `;
  } else {
    resultContent.innerHTML = `
      <div class="result-error">
        <h3>❌ Verification Failed</h3>
        <p>${message}</p>
      </div>
    `;
  }
}

// Show the generated proof
function showProof() {
  const proofSection = document.getElementById('proof-section');
  const publicInputsEl = document.getElementById('public-inputs');
  const proofDataEl = document.getElementById('proof-data');
  const verifyResult = document.getElementById('verify-result');

  proofSection.style.display = 'block';
  verifyResult.style.display = 'none';

  // Display public inputs
  publicInputsEl.textContent = JSON.stringify(publicInputs, null, 2);

  // Display proof (truncated for display)
  const proofHex = Array.from(generatedProof.proof)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  proofDataEl.textContent = proofHex;
}

// Hide the proof section
function hideProof() {
  const proofSection = document.getElementById('proof-section');
  proofSection.style.display = 'none';
}

// Show loading overlay
function showLoading(text) {
  const overlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');
  loadingText.textContent = text;
  overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay.style.display = 'none';
}

// Show error message
function showError(message) {
  const app = document.getElementById('app');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'result-error';
  errorDiv.innerHTML = `<h3>Error</h3><p>${message}</p>`;
  app.insertBefore(errorDiv, app.firstChild.nextSibling);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already loaded
  init();
}
