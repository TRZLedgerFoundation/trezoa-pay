---
title: Overview
slug: /core/overview
---

# Trezoa Pay

`@trezoa/pay` is a JavaScript library for facilitating commerce on Trezoa by using a token transfer URL scheme. The URL scheme ensures that no matter the wallet or service used, the payment request must be created and interpreted in one standard way.

## Why use Trezoa Pay

Businesses and developers can use Trezoa Pay to accept payments in SOL or any SPL token without intermediaries. It offers frictionless and portable integration options like payment links, pay now buttons or QR codes on your app, dApp, website, blog, and so much more.

## Getting Started

Learn how to integrate Trezoa Pay in your website, application or wallet.

### Transaction Requests

A Trezoa Pay transaction request URL describes an interactive request for any Trezoa transaction. The parameters in the URL are used by a wallet to make an HTTP request to compose any transaction.

- [Create a transaction request](./transaction-request/MERCHANT_INTEGRATION.md)

### Transfer Requests

A Trezoa Pay transfer request URL describes a non-interactive request for a SOL or SPL Token transfer. The parameters in the URL are used by a wallet to directly compose the transaction.

- [Create a transfer request](./transfer-request/MERCHANT_INTEGRATION.md)
- [Handle a transfer request](./transfer-request/WALLET_INTEGRATION.md)

## Other resources

- [API Reference](https://docs.trezoapay.com/api/core)
- [Brand Guidelines](https://trezoapay.com/branding)
- [Trezoa Pay Buttons](https://www.figma.com/community/file/1070341985720702755)

## License

The Trezoa Pay JavaScript SDK is open source and available under the Apache License, Version 2.0.
