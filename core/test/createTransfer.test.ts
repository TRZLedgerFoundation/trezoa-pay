import { Keypair, type PublicKey, SystemProgram, Transaction } from '@trezoa/web3.js';
import BigNumber from 'bignumber.js';
import { createTransfer, CreateTransferError } from '../src';
import type { Connection } from '@trezoa/web3.js';
import * as tpl from '@trezoa/tpl-token';

jest.mock('@trezoa/tpl-token', () => {
    const actual = jest.requireActual('@trezoa/tpl-token');
    return {
        ...actual,
        getMint: jest.fn(),
        getAccount: jest.fn(),
        getAssociatedTokenAddress: jest.fn(),
    };
});

const mockedTplToken = jest.mocked(tpl);

// Test Constants
const TEST_AMOUNTS = {
    ONE_TOKEN: new BigNumber(1),
    TWO_TOKENS: new BigNumber(2),
} as const;

const TEST_BALANCES = {
    SENDER_TRZ: 1000000000, // 1 TRZ in lamports
    RECIPIENT_TRZ: 0,
    SENDER_TOKENS: BigInt(1000000), // 1 token with 6 decimals
    RECIPIENT_TOKENS: BigInt(0),
    INSUFFICIENT_TOKENS: BigInt(1),
} as const;

const MOCK_VALUES = {
    BLOCKHASH: 'blockhash',
    BLOCK_HEIGHT: 100,
    MINT_DECIMALS: 6,
    SLOT: 1,
} as const;

// Test Fixtures
class TestFixtures {
    readonly sender = Keypair.generate().publicKey;
    readonly recipient = Keypair.generate().publicKey;
    readonly tplToken = Keypair.generate().publicKey;
    readonly mintAuthority = Keypair.generate().publicKey;
    readonly senderATA = Keypair.generate().publicKey;
    readonly recipientATA = Keypair.generate().publicKey;
}

// Mock Factories
class MockFactories {
    static createAccountInfo(owner: PublicKey, lamports: number, executable = false) {
        return {
            owner,
            executable,
            lamports,
            data: Buffer.alloc(0),
        };
    }

    static createParsedAccountInfo(owner: PublicKey) {
        return {
            context: { slot: MOCK_VALUES.SLOT },
            value: {
                owner,
                executable: false,
                lamports: 0,
                data: Buffer.alloc(0),
            },
        };
    }

    static createMint(params: {
        address: PublicKey;
        mintAuthority: PublicKey;
        isInitialized?: boolean;
        decimals?: number;
    }) {
        const { address, mintAuthority, isInitialized = true, decimals = MOCK_VALUES.MINT_DECIMALS } = params;
        return {
            address,
            mintAuthority,
            supply: BigInt(1000000000),
            decimals,
            isInitialized,
            freezeAuthority: null,
            tlvData: Buffer.alloc(0),
        };
    }

    static createTokenAccount(params: {
        address: PublicKey;
        mint: PublicKey;
        owner: PublicKey;
        amount?: bigint;
        isInitialized?: boolean;
        isFrozen?: boolean;
    }) {
        const { address, mint, owner, amount = BigInt(0), isInitialized = true, isFrozen = false } = params;
        return {
            address,
            mint,
            owner,
            amount,
            delegate: null,
            delegatedAmount: BigInt(0),
            isInitialized,
            isFrozen,
            isNative: false,
            rentExemptReserve: BigInt(0),
            closeAuthority: null,
            tlvData: Buffer.alloc(0),
        };
    }

    static createBlockhash() {
        return {
            blockhash: MOCK_VALUES.BLOCKHASH,
            lastValidBlockHeight: MOCK_VALUES.BLOCK_HEIGHT,
        };
    }
}

// Test Helpers
class TestHelpers {
    static setupBasicMocks(connection: jest.Mocked<Connection>, fixtures: TestFixtures) {
        connection.getLatestBlockhash.mockResolvedValue(MockFactories.createBlockhash());

        // Setup sender and recipient accounts for TRZ transfers
        connection.getAccountInfo
            .mockResolvedValueOnce(MockFactories.createAccountInfo(SystemProgram.programId, TEST_BALANCES.SENDER_TRZ))
            .mockResolvedValueOnce(
                MockFactories.createAccountInfo(SystemProgram.programId, TEST_BALANCES.RECIPIENT_TRZ)
            );
    }

    static setupTrzTransferMocks(connection: jest.Mocked<Connection>, fixtures: TestFixtures) {
        this.setupBasicMocks(connection, fixtures);

        // Additional calls for the SystemProgram instruction creation
        connection.getAccountInfo
            .mockResolvedValueOnce(MockFactories.createAccountInfo(SystemProgram.programId, TEST_BALANCES.SENDER_TRZ))
            .mockResolvedValueOnce(
                MockFactories.createAccountInfo(SystemProgram.programId, TEST_BALANCES.RECIPIENT_TRZ)
            );
    }

    static setupTplTokenMocks(
        connection: jest.Mocked<Connection>,
        fixtures: TestFixtures,
        tokenProgram: PublicKey = tpl.TOKEN_PROGRAM_ID
    ) {
        this.setupBasicMocks(connection, fixtures);

        // Mock token account owner checks
        connection.getParsedAccountInfo.mockResolvedValue(MockFactories.createParsedAccountInfo(tokenProgram));

        // Mock mint and token accounts
        mockedTplToken.getMint.mockResolvedValue(
            MockFactories.createMint({
                address: fixtures.tplToken,
                mintAuthority: fixtures.mintAuthority,
            })
        );

        mockedTplToken.getAssociatedTokenAddress
            .mockResolvedValueOnce(fixtures.senderATA)
            .mockResolvedValueOnce(fixtures.recipientATA);

        mockedTplToken.getAccount
            .mockResolvedValueOnce(
                MockFactories.createTokenAccount({
                    address: fixtures.senderATA,
                    mint: fixtures.tplToken,
                    owner: fixtures.sender,
                    amount: TEST_BALANCES.SENDER_TOKENS,
                })
            )
            .mockResolvedValueOnce(
                MockFactories.createTokenAccount({
                    address: fixtures.recipientATA,
                    mint: fixtures.tplToken,
                    owner: fixtures.recipient,
                    amount: TEST_BALANCES.RECIPIENT_TOKENS,
                })
            );
    }

    static assertTplTokenTransfer(transaction: Transaction, fixtures: TestFixtures, tokenProgram: PublicKey) {
        expect(transaction).toBeInstanceOf(Transaction);
        expect(transaction.instructions.length).toBeGreaterThan(0);

        const tokenInstruction = transaction.instructions.find((ix) => ix.programId.equals(tokenProgram));
        expect(tokenInstruction).toBeDefined();

        if (tokenInstruction) {
            const keyPubkeys = tokenInstruction.keys.map((k) => k.pubkey.toBase58());
            expect(keyPubkeys).toContain(fixtures.senderATA.toBase58());
            expect(keyPubkeys).toContain(fixtures.recipientATA.toBase58());
        }
    }
}

describe('CreateTransferError', () => {
    it('should create error with correct name and message', () => {
        const errorMessage = 'Test error message';
        const error = new CreateTransferError(errorMessage);

        expect(error.name).toBe('CreateTransferError');
        expect(error.message).toBe(errorMessage);
        expect(error).toBeInstanceOf(Error);
    });
});

describe('createTransfer', () => {
    let connection: jest.Mocked<Connection>;
    let fixtures: TestFixtures;

    beforeEach(() => {
        fixtures = new TestFixtures();
        connection = {
            getParsedAccountInfo: jest.fn(),
            getAccountInfo: jest.fn(),
            getLatestBlockhash: jest.fn(),
        } as any;
        jest.clearAllMocks();
    });

    describe('TRZ transfers', () => {
        it('should create a valid TRZ transfer transaction', async () => {
            TestHelpers.setupTrzTransferMocks(connection, fixtures);

            const transaction = await createTransfer(connection, fixtures.sender, {
                recipient: fixtures.recipient,
                amount: TEST_AMOUNTS.ONE_TOKEN,
            });

            expect(transaction).toBeInstanceOf(Transaction);
            expect(connection.getAccountInfo).toHaveBeenCalledTimes(4);
            expect(connection.getLatestBlockhash).toHaveBeenCalledTimes(1);
        });

        it('should throw when sender account does not exist', async () => {
            connection.getAccountInfo.mockResolvedValueOnce(null);

            await expect(
                createTransfer(connection, fixtures.sender, {
                    recipient: fixtures.recipient,
                    amount: TEST_AMOUNTS.ONE_TOKEN,
                })
            ).rejects.toThrow(CreateTransferError);
        });

        it('should throw when recipient account does not exist', async () => {
            connection.getAccountInfo
                .mockResolvedValueOnce(
                    MockFactories.createAccountInfo(SystemProgram.programId, TEST_BALANCES.SENDER_TRZ)
                )
                .mockResolvedValueOnce(null);

            await expect(
                createTransfer(connection, fixtures.sender, {
                    recipient: fixtures.recipient,
                    amount: TEST_AMOUNTS.ONE_TOKEN,
                })
            ).rejects.toThrow(CreateTransferError);
        });
    });

    describe('TPL Token transfers', () => {
        it('should create a valid TPL token transfer transaction', async () => {
            TestHelpers.setupTplTokenMocks(connection, fixtures);

            const transaction = await createTransfer(connection, fixtures.sender, {
                recipient: fixtures.recipient,
                amount: TEST_AMOUNTS.ONE_TOKEN,
                tplToken: fixtures.tplToken,
            });

            TestHelpers.assertTplTokenTransfer(transaction, fixtures, tpl.TOKEN_PROGRAM_ID);
            expect(mockedTplToken.getMint).toHaveBeenCalledTimes(1);
            expect(mockedTplToken.getAccount).toHaveBeenCalledTimes(2);
        });

        it('should create a valid Token-2022 transfer transaction', async () => {
            TestHelpers.setupTplTokenMocks(connection, fixtures, tpl.TOKEN_2022_PROGRAM_ID);

            const transaction = await createTransfer(connection, fixtures.sender, {
                recipient: fixtures.recipient,
                amount: TEST_AMOUNTS.ONE_TOKEN,
                tplToken: fixtures.tplToken,
            });

            TestHelpers.assertTplTokenTransfer(transaction, fixtures, tpl.TOKEN_2022_PROGRAM_ID);
        });

        describe('TPL Token validation errors', () => {
            it('should throw when mint is not initialized', async () => {
                TestHelpers.setupBasicMocks(connection, fixtures);
                connection.getParsedAccountInfo.mockResolvedValue(
                    MockFactories.createParsedAccountInfo(tpl.TOKEN_PROGRAM_ID)
                );

                mockedTplToken.getMint.mockResolvedValue(
                    MockFactories.createMint({
                        address: fixtures.tplToken,
                        mintAuthority: fixtures.mintAuthority,
                        isInitialized: false,
                    })
                );

                await expect(
                    createTransfer(connection, fixtures.sender, {
                        recipient: fixtures.recipient,
                        amount: TEST_AMOUNTS.ONE_TOKEN,
                        tplToken: fixtures.tplToken,
                    })
                ).rejects.toThrow(CreateTransferError);
            });

            it('should throw when sender token account is not initialized', async () => {
                TestHelpers.setupBasicMocks(connection, fixtures);
                connection.getParsedAccountInfo.mockResolvedValue(
                    MockFactories.createParsedAccountInfo(tpl.TOKEN_PROGRAM_ID)
                );

                mockedTplToken.getMint.mockResolvedValue(
                    MockFactories.createMint({
                        address: fixtures.tplToken,
                        mintAuthority: fixtures.mintAuthority,
                    })
                );

                mockedTplToken.getAssociatedTokenAddress.mockResolvedValueOnce(fixtures.senderATA);
                mockedTplToken.getAccount.mockResolvedValueOnce(
                    MockFactories.createTokenAccount({
                        address: fixtures.senderATA,
                        mint: fixtures.tplToken,
                        owner: fixtures.sender,
                        isInitialized: false,
                    })
                );

                await expect(
                    createTransfer(connection, fixtures.sender, {
                        recipient: fixtures.recipient,
                        amount: TEST_AMOUNTS.ONE_TOKEN,
                        tplToken: fixtures.tplToken,
                    })
                ).rejects.toThrow(CreateTransferError);
            });

            it('should throw when sender token account is frozen', async () => {
                TestHelpers.setupBasicMocks(connection, fixtures);
                connection.getParsedAccountInfo.mockResolvedValue(
                    MockFactories.createParsedAccountInfo(tpl.TOKEN_PROGRAM_ID)
                );

                mockedTplToken.getMint.mockResolvedValue(
                    MockFactories.createMint({
                        address: fixtures.tplToken,
                        mintAuthority: fixtures.mintAuthority,
                    })
                );

                mockedTplToken.getAssociatedTokenAddress.mockResolvedValueOnce(fixtures.senderATA);
                mockedTplToken.getAccount.mockResolvedValueOnce(
                    MockFactories.createTokenAccount({
                        address: fixtures.senderATA,
                        mint: fixtures.tplToken,
                        owner: fixtures.sender,
                        isFrozen: true,
                        amount: TEST_BALANCES.SENDER_TOKENS,
                    })
                );

                await expect(
                    createTransfer(connection, fixtures.sender, {
                        recipient: fixtures.recipient,
                        amount: TEST_AMOUNTS.ONE_TOKEN,
                        tplToken: fixtures.tplToken,
                    })
                ).rejects.toThrow(CreateTransferError);
            });

            it('should throw when recipient token account is not initialized', async () => {
                TestHelpers.setupBasicMocks(connection, fixtures);
                connection.getParsedAccountInfo.mockResolvedValue(
                    MockFactories.createParsedAccountInfo(tpl.TOKEN_PROGRAM_ID)
                );

                mockedTplToken.getMint.mockResolvedValue(
                    MockFactories.createMint({
                        address: fixtures.tplToken,
                        mintAuthority: fixtures.mintAuthority,
                    })
                );

                mockedTplToken.getAssociatedTokenAddress
                    .mockResolvedValueOnce(fixtures.senderATA)
                    .mockResolvedValueOnce(fixtures.recipientATA);

                mockedTplToken.getAccount
                    .mockResolvedValueOnce(
                        MockFactories.createTokenAccount({
                            address: fixtures.senderATA,
                            mint: fixtures.tplToken,
                            owner: fixtures.sender,
                            amount: TEST_BALANCES.SENDER_TOKENS,
                        })
                    )
                    .mockResolvedValueOnce(
                        MockFactories.createTokenAccount({
                            address: fixtures.recipientATA,
                            mint: fixtures.tplToken,
                            owner: fixtures.recipient,
                            isInitialized: false,
                        })
                    );

                await expect(
                    createTransfer(connection, fixtures.sender, {
                        recipient: fixtures.recipient,
                        amount: TEST_AMOUNTS.ONE_TOKEN,
                        tplToken: fixtures.tplToken,
                    })
                ).rejects.toThrow(CreateTransferError);
            });

            it('should throw when recipient token account is frozen', async () => {
                TestHelpers.setupBasicMocks(connection, fixtures);
                connection.getParsedAccountInfo.mockResolvedValue(
                    MockFactories.createParsedAccountInfo(tpl.TOKEN_PROGRAM_ID)
                );

                mockedTplToken.getMint.mockResolvedValue(
                    MockFactories.createMint({
                        address: fixtures.tplToken,
                        mintAuthority: fixtures.mintAuthority,
                    })
                );

                mockedTplToken.getAssociatedTokenAddress
                    .mockResolvedValueOnce(fixtures.senderATA)
                    .mockResolvedValueOnce(fixtures.recipientATA);

                mockedTplToken.getAccount
                    .mockResolvedValueOnce(
                        MockFactories.createTokenAccount({
                            address: fixtures.senderATA,
                            mint: fixtures.tplToken,
                            owner: fixtures.sender,
                            amount: TEST_BALANCES.SENDER_TOKENS,
                        })
                    )
                    .mockResolvedValueOnce(
                        MockFactories.createTokenAccount({
                            address: fixtures.recipientATA,
                            mint: fixtures.tplToken,
                            owner: fixtures.recipient,
                            isFrozen: true,
                        })
                    );

                await expect(
                    createTransfer(connection, fixtures.sender, {
                        recipient: fixtures.recipient,
                        amount: TEST_AMOUNTS.ONE_TOKEN,
                        tplToken: fixtures.tplToken,
                    })
                ).rejects.toThrow(CreateTransferError);
            });

            it('should throw when sender has insufficient token balance', async () => {
                TestHelpers.setupBasicMocks(connection, fixtures);
                connection.getParsedAccountInfo.mockResolvedValue(
                    MockFactories.createParsedAccountInfo(tpl.TOKEN_PROGRAM_ID)
                );

                mockedTplToken.getMint.mockResolvedValue(
                    MockFactories.createMint({
                        address: fixtures.tplToken,
                        mintAuthority: fixtures.mintAuthority,
                    })
                );

                mockedTplToken.getAssociatedTokenAddress
                    .mockResolvedValueOnce(fixtures.senderATA)
                    .mockResolvedValueOnce(fixtures.recipientATA);

                mockedTplToken.getAccount
                    .mockResolvedValueOnce(
                        MockFactories.createTokenAccount({
                            address: fixtures.senderATA,
                            mint: fixtures.tplToken,
                            owner: fixtures.sender,
                            amount: TEST_BALANCES.INSUFFICIENT_TOKENS,
                        })
                    )
                    .mockResolvedValueOnce(
                        MockFactories.createTokenAccount({
                            address: fixtures.recipientATA,
                            mint: fixtures.tplToken,
                            owner: fixtures.recipient,
                        })
                    );

                await expect(
                    createTransfer(connection, fixtures.sender, {
                        recipient: fixtures.recipient,
                        amount: TEST_AMOUNTS.TWO_TOKENS,
                        tplToken: fixtures.tplToken,
                    })
                ).rejects.toThrow(CreateTransferError);
            });
        });
    });
});
