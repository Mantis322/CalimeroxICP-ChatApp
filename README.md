# 🌟 DecentralChat - Next Generation Web3 Communication Platform  

![Logo](https://github.com/Mantis322/CalimeroxICP-ChatApp/blob/main/Chat_App/app/Logo.png)

## 🚀 Overview  
DecentralChat is a revolutionary Web3 communication platform built on the Internet Computer Protocol (ICP) network, leveraging the power of Calimero SDK. It combines traditional chat functionality with blockchain capabilities, offering a secure, decentralized, and feature-rich communication experience.  

### ✨ Key Features  
- 🔐 **Decentralized Authentication** using Internet Identity  
- 💬 **Real-time Chat Rooms** with end-to-end message delivery  
- 🎙️ **Voice Rooms** with WebRTC integration (*In Development*)  
- 💰 **ICP Integration** for balance tracking and transfers  
- 🔒 **Password-Protected Rooms** for enhanced security  
- 🔄 **Real-time Updates** using WebSocket connections  

---

## 🌟 What Sets Us Apart  

| Feature               | Traditional Chat Apps         | DecentralChat                          |
|-----------------------|-------------------------------|---------------------------------------|
| **Authentication**    | Centralized servers          | Decentralized (Internet Identity)     |
| **Data Storage**       | Centralized databases        | ICP blockchain network                |
| **Privacy**            | Limited                     | Enhanced with encryption              |
| **Payments**           | Requires third-party integration | Native ICP transfers                |
| **Message History**    | Server-dependent            | Blockchain-backed persistence         |
| **Security**           | Standard encryption         | Blockchain-level security             |
| **Voice Chat**         | Centralized servers         | Decentralized P2P (*Coming soon*)     |
| **User Control**       | Platform controlled         | User-owned data                       |
| **Financial Features** | Limited or None             | Built-in ICP wallet integration       |

---

## 🛠️ Technology Stack  

- **Frontend**: React with TypeScript  
- **Styling**: Tailwind CSS  
- **Blockchain**: Internet Computer Protocol (ICP)  
- **SDK**: Calimero Network SDK  
- **Authentication**: Internet Identity  
- **Voice**: WebRTC (*In Development*)  
- **State Management**: React Hooks  
- **Real-time Updates**: WebSocket  

---

## 🔥 Current Features  

### **Chat System**  
- Create and join password-protected chat rooms  
- Real-time messaging with timestamp support  
- Room management (create, delete, leave)  
- Message search functionality  
- User presence indicators  

### **ICP Integration**  
- Real-time balance tracking  
- Direct ICP transfers through chat commands (*In Development*)  
- Wallet address management  
- Transaction history  

### **Voice Rooms** (*In Development*)  
- Create and join voice channels  
- Real-time voice communication  
- Mute/unmute functionality  
- Room management  

---

## 🔜 Roadmap  

- [x] Basic chat functionality  
- [x] ICP wallet integration  
- [x] Real-time balance tracking
- [x] End-to-end encryption 
- [ ] Direct ICP transfers  
- [ ] Voice room implementation    
- [ ] File sharing  

---
## 🚀 Getting Started

*You can see the detailed installation steps via this [link](https://calimero-network.github.io/tutorials/awesome-projects/building-with-icp).*

To get started with PrivatePrivacy, follow these steps:
Make sure you have these installed and running on your system before you start
- [CalimeroSDK Node](https://calimero-network.github.io/getting-started/setup)
- [Merod](https://calimero-network.github.io/developer-tools/CLI/merod)
- [Meroctl](https://calimero-network.github.io/developer-tools/CLI/meroctl)

-  ```git clone https://github.com/Mantis322/CalimeroxICP-ChatApp.git```
- ```cd CalimeroxICP-ChatApp```
- ```cd icp-devnet```
- ```./deploy_devnet_fresh.sh```
- ```cd Chat_app```
- ```./build.sh```
- ```merod --node-name node1 init --server-port 2428 --swarm-port 2528```
- ```merod --node-name node1 run```
- ```application install file <PATH_TO_blockchain.wasm_FILE>```
- ```context create <APPLICATION_ID> --protocol icp```
- ```http://localhost:2428/admin-api/contexts/CONTEXT_ID/proxy-contract```
- ```dfx identity use initial```
- ```dfx canister call <LEDGER_CONTRACT_ID> icrc1_transfer '(record {to = record {owner = principal "<PROXY_CONTRACT_ID>";subaccount = null;};amount = 1_000_000_000;fee = null;memo = null;from_subaccount = null;created_at_time = null;})'```
- ```dfx canister call bd3sg-teaaa-aaaaa-qaaba-cai icrc1_balance_of '(record {owner = principal "<PROXY_CONTRACT_ID>";subaccount = null;})'```
- ```cd logic```
- ```npm install```
- ```npm run dev```

---

## 📄 License  
This project is licensed under the **MIT License** - see the LICENSE file for details.  

---

Built with ❤️ for the decentralized future

