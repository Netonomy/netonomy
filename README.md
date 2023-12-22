# Netonomy: Internet Freedom 🚀

An application that allows users and organizations to own their digital identities, data, and finances.

## Why?

Today, our online identities are mostly in the hands of big companies and websites. They keep our personal information in their systems, and sometimes this can be risky because they might get hacked. Also, these companies have a lot of control over our information and can use it in ways we might not like. Decentralized Identifiers (DIDs) are like a new kind of online ID that we can control ourselves, without needing these big companies to do it for us. This can make things safer, easier to use, and give us more control over our information.

### The main benefits of DIDs are:

**User Control**: The user has full control over their DID and the associated data, which gives them more privacy and autonomy.

**Interoperability**: DIDs can be used across different systems and platforms, which can simplify the user experience.

**Security**: DIDs can be more secure than traditional identifiers because they are not tied to a central database that could be hacked.

**Verifiable Credentials**: DIDs can be used in conjunction with verifiable credentials to enable trusted digital interactions.

In summary, the main point of DIDs is to give users more control over their digital identities and to enable trusted digital interactions without relying on central authorities.

## 🏗️ Application Services

| Codebase                                 |     Description     |
| :--------------------------------------- | :-----------------: |
| [server](server)                         | Node Express Server |
| [tauri app](tauri-app)                 |  Tauri App (Desktop and Mobile App) | 

## 🏃‍♂️ How to run locally

**Prequisites:**

- Install Docker

\*\* Notes

We are esentially creating a digital agent of the user
And the protocol layer for digital agents to speak with eachother
There will be a need for some kind go server so that your digital agent can be on at all times

DID, DWN, VC are the digital identity layer

Vector DB, LLM are the AI layer

We offer different solutions for running your digital agent

1. **Open Source (Self-Hosted):**

   - Users can download the open-source software and run their AI agents on their own hardware or cloud infrastructure.
   - This option appeals to users who want maximum control and have the technical capability to manage their own infrastructure.
   - It also allows users to ensure that their data remains private and within their control.

2. **Hosting (Managed Hosting):**

   - You can offer managed hosting services where you take care of the server infrastructure, but the AI agent runs in an isolated environment dedicated to the user.
   - This option is suitable for users who prefer not to deal with the complexity of self-hosting but still want a level of control and privacy.
   - You can offer different levels of hosting plans based on resource usage, support, and scalability requirements.
   - Your own lightning node

3. **Netonomy Hosted Platform (Fully Managed):**
   - Users can opt to have their AI agents hosted on your fully managed platform.
   - This is the most user-friendly option, requiring minimal technical knowledge from the user.
   - The platform can handle all aspects of running the AI agent, including maintenance, updates, and scaling.
   - While this option offers convenience, it may raise concerns about data privacy and control, so it's important to be transparent about how user data is handled and to provide robust security measures.
   - Custodial Lightning wallet

Secure Client and Server communication with: https://github.com/passwordless-id/webauthn
