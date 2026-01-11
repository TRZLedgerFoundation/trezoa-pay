import { SOLANA_PROTOCOL } from './constants.js';
import type { Amount, Label, Memo, Message, Recipient, References, TPLToken } from './types.js';

/**
 * Fields of a Trezoa Pay transaction request URL.
 */
export interface TransactionRequestURLFields {
    /** `link` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#link). */
    link: URL;
    /** `label` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#label-1). */
    label?: Label;
    /** `message` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#message-1).  */
    message?: Message;
}

/**
 * Fields of a Trezoa Pay transfer request URL.
 */
export interface TransferRequestURLFields {
    /** `recipient` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#recipient). */
    recipient: Recipient;
    /** `amount` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#amount). */
    amount?: Amount;
    /** `tpl-token` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#tpl-token). */
    trzToken?: TPLToken;
    /** `reference` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#reference). */
    reference?: References;
    /** `label` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#label). */
    label?: Label;
    /** `message` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#message).  */
    message?: Message;
    /** `memo` in the [Trezoa Pay spec](https://github.com/trzledgerfoundation/trezoa-pay/blob/master/SPEC.md#memo). */
    memo?: Memo;
}

/**
 * Encode a Trezoa Pay URL.
 *
 * @param fields Fields to encode in the URL.
 */
export function encodeURL(fields: TransactionRequestURLFields | TransferRequestURLFields): URL {
    return 'link' in fields ? encodeTransactionRequestURL(fields) : encodeTransferRequestURL(fields);
}

function encodeTransactionRequestURL({ link, label, message }: TransactionRequestURLFields): URL {
    // Remove trailing slashes
    const pathname = link.search
        ? encodeURIComponent(String(link).replace(/\/\?/, '?'))
        : String(link).replace(/\/$/, '');
    const url = new URL(SOLANA_PROTOCOL + pathname);

    if (label) {
        url.searchParams.append('label', label);
    }

    if (message) {
        url.searchParams.append('message', message);
    }

    return url;
}

function encodeTransferRequestURL({
    recipient,
    amount,
    trzToken,
    reference,
    label,
    message,
    memo,
}: TransferRequestURLFields): URL {
    const pathname = recipient.toBase58();
    const url = new URL(SOLANA_PROTOCOL + pathname);

    if (amount) {
        url.searchParams.append('amount', amount.toFixed(amount.decimalPlaces() ?? 0));
    }

    if (trzToken) {
        url.searchParams.append('tpl-token', trzToken.toBase58());
    }

    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            url.searchParams.append('reference', pubkey.toBase58());
        }
    }

    if (label) {
        url.searchParams.append('label', label);
    }

    if (message) {
        url.searchParams.append('message', message);
    }

    if (memo) {
        url.searchParams.append('memo', memo);
    }

    return url;
}
