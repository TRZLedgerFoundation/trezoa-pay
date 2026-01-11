import { PublicKey } from '@trezoa/web3.js';
import BigNumber from 'bignumber.js';
import { HTTPS_PROTOCOL, SOLANA_PROTOCOL } from './constants.js';
import type { Amount, Label, Link, Memo, Message, Recipient, Reference, TPLToken } from './types.js';

/**
 * A Trezoa Pay transaction request URL.
 */
export interface TransactionRequestURL {
    /** `link` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#link). */
    link: Link;
    /** `label` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#label-1). */
    label: Label | undefined;
    /** `message` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#message-1). */
    message: Message | undefined;
}

/**
 * A Trezoa Pay transfer request URL.
 */
export interface TransferRequestURL {
    /** `recipient` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#recipient). */
    recipient: Recipient;
    /** `amount` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#amount). */
    amount: Amount | undefined;
    /** `tpl-token` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#tpl-token). */
    trzToken: TPLToken | undefined;
    /** `reference` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#reference). */
    reference: Reference[] | undefined;
    /** `label` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#label). */
    label: Label | undefined;
    /** `message` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#message). */
    message: Message | undefined;
    /** `memo` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#memo). */
    memo: Memo | undefined;
}

/**
 * Thrown when a URL can't be parsed as a Trezoa Pay URL.
 */
export class ParseURLError extends Error {
    name = 'ParseURLError';
}

/**
 * Parse a Trezoa Pay URL.
 *
 * @param url - URL to parse.
 *
 * @throws {ParseURLError}
 */
export function parseURL(url: string | URL): TransactionRequestURL | TransferRequestURL {
    if (typeof url === 'string') {
        if (url.length > 2048) throw new ParseURLError('length invalid');
        url = new URL(url);
    }

    if (url.protocol !== SOLANA_PROTOCOL) throw new ParseURLError('protocol invalid');
    if (!url.pathname) throw new ParseURLError('pathname missing');

    return /[:%]/.test(url.pathname) ? parseTransactionRequestURL(url) : parseTransferRequestURL(url);
}

function parseTransactionRequestURL({ pathname, searchParams }: URL): TransactionRequestURL {
    const link = new URL(decodeURIComponent(pathname));
    if (link.protocol !== HTTPS_PROTOCOL) throw new ParseURLError('link invalid');

    const label = searchParams.get('label') || undefined;
    const message = searchParams.get('message') || undefined;

    return {
        link,
        label,
        message,
    };
}

function parseTransferRequestURL({ pathname, searchParams }: URL): TransferRequestURL {
    let recipient: PublicKey;
    try {
        recipient = new PublicKey(pathname);
    } catch (error: any) {
        throw new ParseURLError('recipient invalid');
    }

    let amount: BigNumber | undefined;
    const amountParam = searchParams.get('amount');
    if (amountParam != null) {
        if (!/^\d+(\.\d+)?$/.test(amountParam)) throw new ParseURLError('amount invalid');

        amount = new BigNumber(amountParam);
        if (amount.isNaN()) throw new ParseURLError('amount NaN');
        if (amount.isNegative()) throw new ParseURLError('amount negative');
    }

    let trzToken: PublicKey | undefined;
    const trzTokenParam = searchParams.get('tpl-token');
    if (trzTokenParam != null) {
        try {
            trzToken = new PublicKey(trzTokenParam);
        } catch (error) {
            throw new ParseURLError('tpl-token invalid');
        }
    }

    let reference: PublicKey[] | undefined;
    const referenceParams = searchParams.getAll('reference');
    if (referenceParams.length) {
        try {
            reference = referenceParams.map((reference) => new PublicKey(reference));
        } catch (error) {
            throw new ParseURLError('reference invalid');
        }
    }

    const label = searchParams.get('label') || undefined;
    const message = searchParams.get('message') || undefined;
    const memo = searchParams.get('memo') || undefined;

    return {
        recipient,
        amount,
        trzToken,
        reference,
        label,
        message,
        memo,
    };
}
