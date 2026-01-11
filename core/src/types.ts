import type { PublicKey } from '@trezoa/web3.js';
import type BigNumber from 'bignumber.js';

/** `recipient` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#recipient). */
export type Recipient = PublicKey;

/** `amount` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#amount). */
export type Amount = BigNumber;

/** `tpl-token` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#tpl-token). */
export type TPLToken = PublicKey;

/** `reference` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#reference). */
export type Reference = PublicKey;

/** `reference` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#reference). */
export type References = Reference | Reference[];

/** `label` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#label). */
export type Label = string;

/** `message` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#message). */
export type Message = string;

/** `memo` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#memo). */
export type Memo = string;

/** `link` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#link). */
export type Link = URL;
