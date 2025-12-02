# 🔐 Noir Age Verification dApp

A privacy-preserving age verification application built with [Noir](https://noir-lang.org/), a domain-specific language for writing zero-knowledge proofs. This dApp allows users to prove they are above a certain age (e.g., 18+) without revealing their actual birth date.

## 🌟 Features

- **Zero-Knowledge Proof**: Proves age requirement without revealing actual birth date
- **Client-Side Proof Generation**: All computations happen in the browser - your data never leaves your device
- **Modern Web Interface**: Clean, responsive UI built with vanilla JavaScript and CSS
- **Real-Time Verification**: Instantly verify generated proofs

## 📁 Project Structure

```
noir-age-verification-dapp/
├── circuits/
│   └── age_verification/        # Noir circuit
│       ├── src/
│       │   └── main.nr          # Age verification circuit logic
│       ├── Nargo.toml           # Noir project configuration
│       └── Prover.toml          # Example prover inputs
├── frontend/
│   ├── src/
│   │   ├── main.js              # Application logic
│   │   └── style.css            # Styling
│   ├── index.html               # Main HTML page
│   ├── vite.config.js           # Vite configuration
│   └── package.json             # Frontend dependencies
└── README.md
```

## 🔧 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Nargo](https://noir-lang.org/docs/getting_started/installation/) (Noir's package manager)

### Installing Nargo

```bash
# Install noirup (Noir version manager)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash

# Install the latest version of nargo
noirup
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sagarmetaverse/noir-age-verification-dapp.git
cd noir-age-verification-dapp
```

### 2. Compile the Noir Circuit

```bash
cd circuits/age_verification
nargo compile
```

### 3. Run Circuit Tests

```bash
nargo test
```

Expected output:
```
[age_verification] Running 6 test functions
[age_verification] Testing test_exactly_18 ... ok
[age_verification] Testing test_adult_birthday_passed ... ok
[age_verification] Testing test_adult_birthday_not_passed ... ok
[age_verification] Testing test_almost_18_fail ... ok
[age_verification] Testing test_under_18_fail ... ok
[age_verification] Testing test_just_turned_18 ... ok
[age_verification] 6 tests passed
```

### 4. Install Frontend Dependencies

```bash
cd ../../frontend
npm install
```

### 5. Start the Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
npm run preview
```

## 📋 How It Works

### The Zero-Knowledge Circuit

The Noir circuit (`circuits/age_verification/src/main.nr`) takes the following inputs:

**Private Inputs** (never revealed):
- `birth_year`: Year of birth (e.g., 1990)
- `birth_month`: Month of birth (1-12)
- `birth_day`: Day of birth (1-31)

**Public Inputs** (revealed in proof):
- `current_year`: Current year
- `current_month`: Current month
- `current_day`: Current day
- `min_age`: Minimum age to verify (e.g., 18)

The circuit:
1. Validates date inputs
2. Calculates the actual age considering whether the birthday has passed this year
3. Asserts that the calculated age is at least `min_age`

### Frontend Flow

1. User enters their birth date (kept private)
2. Application generates a zero-knowledge proof in the browser
3. The proof can be verified by anyone without learning the actual birth date
4. Only the public inputs (current date and minimum age) are revealed

## 🌐 Network Requirements

The first time you generate a proof, the application needs to download cryptographic setup data (Common Reference String / CRS) from Aztec's servers. This is approximately 100MB of data and is cached in your browser for subsequent uses.

**Note**: This download requires internet access. If you're behind a restrictive firewall or using ad blockers, you may need to whitelist `aztec-ignition.s3.amazonaws.com`.

## 🛡️ Privacy Guarantees

- Your birth date **never leaves your browser**
- The proof only reveals that you meet the age requirement
- Even the verifier cannot determine your actual age or birth date
- The cryptographic proof is mathematically sound and cannot be forged

## 🧪 Testing the Circuit

You can test the circuit with different inputs:

```bash
cd circuits/age_verification

# Edit Prover.toml to change inputs
# Then execute:
nargo execute

# Generate a proof:
nargo prove

# Verify the proof:
nargo verify
```

## 🏗️ Technical Details

- **Circuit Language**: Noir (v0.36.0)
- **Proving Backend**: UltraHonk (via @noir-lang/backend_barretenberg)
- **Frontend**: Vanilla JavaScript with Vite
- **Styling**: Custom CSS with CSS variables

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Resources

- [Noir Documentation](https://noir-lang.org/docs)
- [Noir.js Guide](https://noir-lang.org/docs/noir/noir_js)
- [Zero-Knowledge Proofs Explained](https://ethereum.org/en/zero-knowledge-proofs/)
