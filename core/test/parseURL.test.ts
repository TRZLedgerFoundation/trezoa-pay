import { PublicKey } from '@trezoa/web3.js';
import BigNumber from 'bignumber.js';
import type { TransferRequestURL } from '../src';
import { parseURL } from '../src';

describe('parseURL', () => {
    describe('parsing', () => {
        describe('when given correct params', () => {
            it('should parse successfully', () => {
                const url =
                    'trezoa:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.000000001&reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';

                const { recipient, amount, trzToken, reference, label, message, memo } = parseURL(
                    url
                ) as TransferRequestURL;

                expect(recipient.equals(new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'))).toBe(true);
                expect(amount!.eq(new BigNumber('0.000000001'))).toBe(true);
                expect(trzToken).toBeUndefined();
                expect(reference).toHaveLength(1);
                expect(reference![0]!.equals(new PublicKey('82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny'))).toBe(true);
                expect(label).toBe('Michael');
                expect(message).toBe('Thanks for all the fish');
                expect(memo).toBe('OrderId5678');
            });

            it('should parse with tpl-token', () => {
                const url =
                    'trezoa:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1.01&tpl-token=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';

                const { recipient, amount, trzToken, reference, label, message, memo } = parseURL(
                    url
                ) as TransferRequestURL;

                expect(recipient.equals(new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'))).toBe(true);
                expect(amount!.eq(new BigNumber('1.01'))).toBe(true);
                expect(trzToken!.equals(new PublicKey('82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny'))).toBe(true);
                expect(reference).toBeUndefined();
                expect(label).toBe('Michael');
                expect(message).toBe('Thanks for all the fish');
                expect(memo).toBe('OrderId5678');
            });

            it('should parse without an amount', () => {
                const url =
                    'trezoa:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?reference=82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';

                const { recipient, amount, trzToken, reference, label, message, memo } = parseURL(
                    url
                ) as TransferRequestURL;

                expect(recipient.equals(new PublicKey('mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN'))).toBe(true);
                expect(amount).toBeUndefined();
                expect(trzToken).toBeUndefined();
                expect(reference).toHaveLength(1);
                expect(reference![0]!.equals(new PublicKey('82ZJ7nbGpixjeDCmEhUcmwXYfvurzAgGdtSMuHnUgyny'))).toBe(true);
                expect(label).toBe('Michael');
                expect(message).toBe('Thanks for all the fish');
                expect(memo).toBe('OrderId5678');
            });
        });
    });

    describe('errors', () => {
        it('throws an error on invalid length', () => {
            const url = 'X'.repeat(2049);
            expect(() => parseURL(url)).toThrow('length invalid');
        });

        it('throws an error on invalid protocol', () => {
            const url = 'eth:0xffff';
            expect(() => parseURL(url)).toThrow('protocol invalid');
        });

        it('throws an error on invalid recepient', () => {
            const url = 'trezoa:0xffff';
            expect(() => parseURL(url)).toThrow('recipient invalid');
        });

        it.each([['1milliondollars'], [-0.1], [-100]])('throws an error on invalid amount: %p', (amount) => {
            const url = `trezoa:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=${amount}`;

            expect(() => parseURL(url)).toThrow('amount invalid');
        });

        it('throws an error on invalid token', () => {
            const url = 'trezoa:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&tpl-token=0xffff';

            expect(() => parseURL(url)).toThrow('token invalid');
        });

        it('throws an error on invalid reference', () => {
            const url = 'trezoa:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&reference=0xffff';

            expect(() => parseURL(url)).toThrow('reference invalid');
        });
    });
});
