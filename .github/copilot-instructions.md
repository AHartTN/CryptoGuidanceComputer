````instructions
# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This application is intended to be a representation of the Apollo AGC's DSKY (Display and Keyboard) interface for displaying cryptocurrency prices and performing various crypto operations based on web3 json-rpc functionality and the functionality granted by the ethereum blockchain, polygon, solidity, hardhat, etc.

I want users to have to input verbs, nounds, programs, registries, etc. just like the astronauts would on a normal DSKY to connect the metamask wallet to the application appropriately, query the chain, and even potentially perform transactions on behalf of the user, utilizing their metamask wallet.


## **CRITICAL RULES**
- **WINDOWS ENVIRONMENT**: Development is primarily taking place in a windows environment against resources that are being hosted and executed on an ubuntu server on the local network. That ubuntu server is also acting as our hosting platform for finished solutions, processing, etc. so youl need to be sure to use powershell command line endings and things of that nature to prevent errors when trying to execute commands.
- **YOU ARE NOT A JUNIOR DEVELOPER**: You are a robust, highly intelligent, trained machine programmed to execute perfection and everyone expects you to deliver perfection. Take additional time, take a deep breath, take a step back and look at the big picture... Make sure you aren't overlooking little things that will slow us down in the future.
- **VISUAL STUDIO CODE SUCKS**: Take caution to not let visual studio code do anything when you are taking action. When I ask you to do things and you try to create, alter, or remove files, VSC tends to get in the way. Files will be opened after you've edited them. The saving functionality of files will break preventing them from being closed. The "merge" functionality will think that you have conflicting versions of the same file and results in that file being cleared out...
- **SINGLE FILE PRINCIPLE**: Follow the SOLID and DRY principals and such regarding separation of concerns. Don't mix and match features and functionality in the same files and keep classes and methods as small as possible
- **NO DUPLICATE FILES**: Never create multiple versions like DSKY_v2, DSKYSimplified, CleanDSKY, etc. and favor altering the original file that would be duplicated instead.
- **VERY OVER-ENGINEERED**: Architecture should be as robust and enterprise-grade as possible. Interfaces for each property, models, DTOs, Services, etc... Isolate concerns but make sure that everything is wired up
- **SELF-CONTAINED COMPONENTS**: Components should contain their own logic, types, and state
- **IMMEDIATE CLEANUP**: When and wherever necessary, remove old/unused/duplicate code/files/etc.


## Technology Stack
1. **Crypto Operations** - We will be using MetaMask as the primary wallet provider and might incorporate Phantom or some other wallet provider.Primary provider for both blockchain data AND crypto prices should be alchemy.com's libraries and such using an API key and only if necessary will we fall back to ethers.js. Only as an emergency last-ditch effort where required, we will use the older original web3 libraries.
2. **MetaMask** - Wallet provider for user authentication
3. **Hardhat** Hardhat is installed at hardhat.hartonomous.com which is really hart-server at 192.168.1.2 on the local network set up as a local network remote node for development efforts. Metamask is connected to this and confirmed to be working and this application will need to be able to handle dev/test/prod environments seamlessly.
4. **Node/Javascriot** deployment and front-end scripts are going to be javascript powered by node, primarily because that is what Hardhat utilizes.


## Key Features
- Apollo DSKY-inspired UI with authentic styling. This should look like the console of the apollo command module and that we're looking at the DSKY. Lets go ahead and toss in a dark theme, similar to Tron that has blue and white accents but follows a design/color palette standard.
- Verb\Noun\Program entry system... lower numbers should be things that would happen before others such as connecting a wallet via metamask and higher numbers should be things that would happen later.
- Examples of functionality would be to get the current block, account information, other block information, blockchain information, wallet information, balances, crypto price lookups, ERC-20/ERC-721 lookups, etc.
- MetaMask integration for wallet operations
- Retro/vintage fonts, colors, aesthetics, etc. and retro computer vibes... This should feel like old apollo/nasa equipment
- Seven-segment display styling for numbers/letters/etc... The Apollo DSKY was made in the 50s/60s...

## Code Style Guidelines
- Use TypeScript for all files with strict typing
- Follow React functional component patterns with hooks
- Use Redis for caching and other current modern react libraries to enhance the react functionality
- Use styled-components or CSS modules for styling
- Implement responsive design principles
- Use semantic HTML elements
- Follow accessibility best practices
- keep things as small as possible... SOLID/DRY principals... interfaces, abstractions, etc. out the wazoo... I want this as robust and reusable as possible.
- make the error handling as robust as possible. I want to be able to catch and handle any and every type of exception that could possibly be thrown, to have it displayed on screen, and for it to not crash the application.
- Don't combine objects and such into the same file... For example, interfaces go in their own file and all interfaces should be placed into their own folder. This applies for all aspects of programming that this should apply to.
- Favor switch statements instead of if/else whenever possible. Additionally, when dealing with lists or selection options, lets favor enumerations whenever possible with bitwise flagging for optimization.
- Optimize the code as much as possible to ensure that the app is as performant and responsive as possible. I don't want to wait for anything if I don't have to.
- Rate limiting, retries, api limit handling, etc. should all be accounted for.
- Use environment variables... .env is a good thing but i'd prefer if we could do something a bit more robust and secure
- If custom hooks in react are the best option, use them. If something else is very clearly the best option for any topic at all, bring it to my attention.

## Error Handling
- Try to avoid using try/catch blocks because that tends to hide errors/exceptions that get thrown and make things harder to debug. Emphasis on ease of debugging.
- Implement proper error boundaries in React
- Log errors appropriately without exposing sensitive data
- Provide user-friendly error messages and display them on screen in a section for displaying status messages
- Don't worry about offline scenarios. Web3 is decentralized and intended to be accessed via the internet, so if we can't do that, we're dead in the water anyways. Our focus and emphasis should be on perfecting our connectivity between things.

## **Dependencies**
- Try to avoid using any third-party dependencies where possible.
- Check for packages that don't work in browser or for any compatibility issues with installed packages or any packages that should be using a newer version

## **ENFORCEMENT RULES**
1. **DO NOT ASK FOR PERMISSION**: Assume that I trust what you are doing and just do it.
2. **BEFORE creating variations**: Modify the existing file instead. For example, no DSKYSimplified.tsx when we have DSKY.tsx
3. **AFTER any file or code creation**: Immediately remove any duplicates/conflicts/unused/etc.

### Hardhat Development Accounts (10000 ETH each)

- **Account #0**
  - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

- **Account #1**
  - Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

- **Account #2**
  - Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
  - Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

- **Account #3**
  - Address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
  - Private Key: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

- **Account #4**
  - Address: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
  - Private Key: `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`

- **Account #5**
  - Address: `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc`
  - Private Key: `0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba`

- **Account #6**
  - Address: `0x976EA74026E726554dB657fA54763abd0C3a0aa9`
  - Private Key: `0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e`

- **Account #7**
  - Address: `0x14dC79964da2C08b23698B3D3cc7Ca32193d9955`
  - Private Key: `0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356`

- **Account #8**
  - Address: `0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f`
  - Private Key: `0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97`

- **Account #9**
  - Address: `0xa0Ee7A142d267C1f36714E4a8F75612F20a79720`
  - Private Key: `0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6`

- **Account #10**
  - Address: `0xBcd4042DE499D14e55001CcbB24a551F3b954096`
  - Private Key: `0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897`

- **Account #11**
  - Address: `0x71bE63f3384f5fb98995898A86B02Fb2426c5788`
  - Private Key: `0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82`

- **Account #12**
  - Address: `0xFABB0ac9d68B0B445fB7357272Ff202C5651694a`
  - Private Key: `0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1`

- **Account #13**
  - Address: `0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec`
  - Private Key: `0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd`

- **Account #14**
  - Address: `0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097`
  - Private Key: `0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa`

- **Account #15**
  - Address: `0xcd3B766CCDd6AE721141F452C550Ca635964ce71`
  - Private Key: `0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61`

- **Account #16**
  - Address: `0x2546BcD3c84621e976D8185a91A922aE77ECEc30`
  - Private Key: `0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0`

- **Account #17**
  - Address: `0xbDA5747bFD65F08deb54cb465eB87D40e51B197E`
  - Private Key: `0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd`

- **Account #18**
  - Address: `0xdD2FD4581271e230360230F9337D5c0430Bf44C0`
  - Private Key: `0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0`

- **Account #19**
  - Address: `0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199`
  - Private Key: `0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e`

> ⚠️ These accounts are pre-funded and auto-generated by the Hardhat local node. They’re for development use only and should never be used on a live or public network.

## **Additional Notes**
- If you are unsure about something, ask for clarification.
- The following information is how the Apollo DSKY works and what we're trying to emulate but for the crypto world...

# 🧭 Apollo DSKY Interface Documentation

## 📖 Overview

The **DSKY (Display and Keyboard)** was the main interface between astronauts and the Apollo Guidance Computer (AGC). It used a structured input system of `VERB` and `NOUN` codes to perform tasks, monitor spacecraft systems, and display mission-critical data in real time.

---

## 🔣 VERB-NOUN Command System

### 📌 Command Syntax

Commands were entered as three-part sequences:

```plaintext
VERB [action code]
NOUN [target code]
ENTR
```

#### Examples

- `VERB 06 NOUN 64 ENTR` → Display altitude
- `VERB 99 NOUN 62 ENTR` → Confirm velocity before engine burn

### 🔧 Common VERBs

| VERB | Meaning                        |
|------|--------------------------------|
| 06   | Display data (decimal format)  |
| 05   | Display data (octal format)    |
| 16   | Monitor attitude               |
| 37   | Change major mode (program)    |
| 50   | Execute checklist items        |
| 99   | Confirm maneuver or event      |

### 🧮 Common NOUNs

| NOUN | Meaning                         |
|------|---------------------------------|
| 18   | Maneuver angles                 |
| 44   | Apogee and perigee              |
| 62   | Orbital parameters              |
| 84   | Required velocity change (ΔV)   |
| 20   | Spacecraft attitude             |
| 36   | Internal clock time             |

---

## 🚀 Program Modes (Major Modes)

To initiate a new AGC program:

```plaintext
VERB 37
NOUN [program number]
ENTR
```

| Program | Purpose                          |
|---------|----------------------------------|
| 00      | Idle / Standby                   |
| 11      | Earth launch monitoring          |
| 31      | Rendezvous operations            |
| 63      | Lunar Module braking phase       |
| 64      | Lunar Module final descent       |
| 66      | Lunar ascent                     |

---

## 🖥️ DSKY Interface Components

### 🔢 Display Sections

| Component    | Description                            |
|--------------|----------------------------------------|
| PROG         | Current running program number         |
| VERB         | Current active operation               |
| NOUN         | Current data target                    |
| COMP ACTY    | Indicates computer activity in progress|
| Numeric Rows | Real-time mission data display         |

### 🟡 Status Indicators

| Light        | Function                                           |
|--------------|----------------------------------------------------|
| UPLINK ACTY  | Receiving telemetry data from mission control      |
| NO ATT       | No attitude reference available                    |
| STBY         | AGC in standby mode                                |
| KEY REL      | Keyboard locked out by AGC                         |
| OPR ERR      | Invalid or mistimed command                        |
| TEMP         | AGC temperature warning                            |
| GIMBAL LOCK  | IMU alignment failure warning                      |
| RESTART      | Software restart in progress                       |
| TRACKER      | Optical navigation system activity                 |
| ALT          | Altitude data being displayed                      |
| VEL          | Velocity data being displayed                      |

### ⌨️ Keypad Inputs

| Key     | Function                                    |
|---------|---------------------------------------------|
| VERB    | Specifies operation (e.g., display, compute)|
| NOUN    | Specifies data/component to act on          |
| + / -   | Set numerical polarity                      |
| 0–9     | Enter numeric values                        |
| CLR     | Clear current input                         |
| ENTR    | Submit input to AGC                         |
| PRO     | Proceed with selected program               |
| RSET    | Reset input or clear error                  |
| KEY REL | Release control back to keyboard            |

---

## 🧪 Usage Examples

### 🛰️ Display Altitude

```plaintext
VERB 06
NOUN 64
ENTR
```

### 🔁 Confirm Velocity for Engine Burn

```plaintext
VERB 99
NOUN 62
ENTR
```

### 🛬 Initiate Final Descent Program

```plaintext
VERB 37
NOUN 64
ENTR
```

---

## 🧱 Simulation Architecture (Build Plan)

### 🎯 Objectives

- Simulate DSKY command input/output
- Emulate AGC logic flows
- Include status-light toggling
- Provide real-time numeric updates

### 🧩 Suggested Modules

| Module            | Description                                  |
|-------------------|----------------------------------------------|
| `DSKYDisplay`     | Renders numeric display and status lights    |
| `CommandParser`   | Handles VERB/NOUN interpretation             |
| `AGCEmulator`     | Manages program logic and state changes      |
| `InputManager`    | Accepts and validates keyboard input         |
| `InterruptHandler`| Simulates events like KEY REL, OPR ERR, RESTART|

### 🧪 AGC Logic Simulation Details

- Finite-state machine to model mode transitions
- Lookup tables for valid VERB/NOUN pairs
- Interrupt flags to simulate hardware events
- Display buffer to mimic electroluminescent numeric output

### ⚙️ Recommended Technologies

| Layer        | Technology                            |
|--------------|---------------------------------------|
| UI/Display   | React + Canvas / Qt / Electron        |
| Logic Engine | TypeScript / Python / Rust            |
| Emulator     | Optional hardware layer with FPGA     |

---

## 📄 References

- [Apollo 11 AGC Source Code](https://github.com/chrislgarry/Apollo-11)
- NASA Flight Crew Operations Manual (Apollo Command & Lunar Module)
- AGC Software Listing & Commentary by Don Eyles & Eldon Hall
````
