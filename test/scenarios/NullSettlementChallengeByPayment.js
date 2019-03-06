const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlementChallengeByPayment = artifacts.require('NullSettlementChallengeByPayment');
const SignerManager = artifacts.require('SignerManager');
const MockedNullSettlementDisputeByPayment = artifacts.require('MockedNullSettlementDisputeByPayment');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedDriipSettlementState = artifacts.require('MockedDriipSettlementState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('NullSettlementChallengeByPayment', () => {
        let web3NullSettlementChallengeByPayment, ethersNullSettlementChallengeByPayment;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3WalletLocker, ethersWalletLocker;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3NullSettlementDisputeByPayment, ethersNullSettlementDisputeByPayment;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3DriipSettlementState, ethersDriipSettlementState;
        let provider;
        let depositedBalanceType;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

            web3NullSettlementDisputeByPayment = await MockedNullSettlementDisputeByPayment.new();
            ethersNullSettlementDisputeByPayment = new Contract(web3NullSettlementDisputeByPayment.address, MockedNullSettlementDisputeByPayment.abi, glob.signer_owner);
            web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new();
            ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, glob.signer_owner);
            web3DriipSettlementState = await MockedDriipSettlementState.new();
            ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, MockedDriipSettlementState.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3BalanceTracker = await MockedBalanceTracker.new();
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, glob.signer_owner);

            depositedBalanceType = await web3BalanceTracker.depositedBalanceType();
        });

        beforeEach(async () => {
            web3NullSettlementChallengeByPayment = await NullSettlementChallengeByPayment.new(glob.owner);
            ethersNullSettlementChallengeByPayment = new Contract(web3NullSettlementChallengeByPayment.address, NullSettlementChallengeByPayment.abi, glob.signer_owner);

            await ethersNullSettlementChallengeByPayment.setConfiguration(ethersConfiguration.address);
            await ethersNullSettlementChallengeByPayment.setWalletLocker(ethersWalletLocker.address);
            await ethersNullSettlementChallengeByPayment.setBalanceTracker(ethersBalanceTracker.address);
            await ethersNullSettlementChallengeByPayment.setNullSettlementDisputeByPayment(ethersNullSettlementDisputeByPayment.address);
            await ethersNullSettlementChallengeByPayment.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);
            await ethersNullSettlementChallengeByPayment.setDriipSettlementState(ethersDriipSettlementState.address);

            await ethersConfiguration.setEarliestSettlementBlockNumber(0);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementChallengeByPayment.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlementChallengeByPayment.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByPayment.configuration())
                    .should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('setConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementChallengeByPayment.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersNullSettlementChallengeByPayment.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByPayment.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('nullSettlementDisputeByPayment()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByPayment.nullSettlementDisputeByPayment())
                    .should.equal(utils.getAddress(ethersNullSettlementDisputeByPayment.address));
            });
        });

        describe('setNullSettlementDisputeByPayment()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementChallengeByPayment.setNullSettlementDisputeByPayment(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementDisputeByPaymentEvent');

                    (await ethersNullSettlementChallengeByPayment.nullSettlementDisputeByPayment())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByPayment.setNullSettlementDisputeByPayment(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByPayment.nullSettlementChallengeState())
                    .should.equal(utils.getAddress(ethersNullSettlementChallengeState.address));
            });
        });

        describe('setNullSettlementChallengeState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementChallengeByPayment.setNullSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeStateEvent');

                    (await ethersNullSettlementChallengeByPayment.nullSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByPayment.setNullSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementState()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByPayment.driipSettlementState())
                    .should.equal(utils.getAddress(ethersDriipSettlementState.address));
            });
        });

        describe('setDriipSettlementState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementChallengeByPayment.setDriipSettlementState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementStateEvent');

                    (await ethersNullSettlementChallengeByPayment.driipSettlementState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByPayment.setDriipSettlementState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('startChallenge()', () => {
            beforeEach(async () => {
                await ethersWalletLocker._reset();
                await ethersBalanceTracker._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});

                await ethersBalanceTracker._setLogSize(depositedBalanceType, 1, {gasLimit: 1e6});
                await ethersBalanceTracker._setLastLog(depositedBalanceType, 10, 1, {gasLimit: 1e6});

                await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                    mocks.address1, {ct: mocks.address0, id: 0}, 20
                );
            });

            describe('if wallet is locked', () => {
                beforeEach(async () => {
                    await web3WalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeByPayment.startChallenge(
                        10, mocks.address0, 0, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement block number', () => {
                beforeEach(async () => {
                    await web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeByPayment.startChallenge(
                        10, mocks.address0, 0, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersNullSettlementChallengeByPayment.interface.events['StartChallengeEvent'].topics
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersNullSettlementChallengeByPayment.startChallenge(
                        10, mocks.address0, 0, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(glob.owner));
                    proposal.stageAmount._bn.should.eq.BN(10);
                    proposal.targetBalanceAmount._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(mocks.address0);
                    proposal.currency.id._bn.should.eq.BN(0);
                    proposal.blockNumber._bn.should.eq.BN(1);
                    proposal.nonce._bn.should.eq.BN(20);
                    proposal.balanceReward.should.be.true;
                    proposal.challengedHash.should.equal(mocks.hash0);
                    proposal.challengedType.should.be.a('string').that.is.empty;
                });
            });
        });

        describe('startChallengeByProxy()', () => {
            beforeEach(async () => {
                await ethersWalletLocker._reset();
                await ethersBalanceTracker._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});

                await ethersBalanceTracker._setLogSize(depositedBalanceType, 1);
                await ethersBalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                    mocks.address1, {ct: mocks.address0, id: 0}, 20
                );
            });

            describe('if current block number is below earliest settlement block number', () => {
                beforeEach(async () => {
                    await web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeByPayment.startChallengeByProxy(
                        glob.owner, 10, mocks.address0, 0, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersNullSettlementChallengeByPayment.interface.events['StartChallengeByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersNullSettlementChallengeByPayment.startChallengeByProxy(
                        glob.owner, 10, mocks.address0, 0, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(glob.owner));
                    proposal.stageAmount._bn.should.eq.BN(10);
                    proposal.targetBalanceAmount._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(mocks.address0);
                    proposal.currency.id._bn.should.eq.BN(0);
                    proposal.blockNumber._bn.should.eq.BN(1);
                    proposal.nonce._bn.should.eq.BN(20);
                    proposal.balanceReward.should.be.false;
                    proposal.challengedHash.should.equal(mocks.hash0);
                    proposal.challengedType.should.be.a('string').that.is.empty;
                });
            });
        });

        describe('hasProposalExpired()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalExpired(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.hasProposalExpired(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalNonce()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalNonce(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalNonce(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalExpirationTime()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalExpirationTime(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalExpirationTime(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalStatus()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalStatus(mocks.settlementStatuses.indexOf('Disqualified'));
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalStatus(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
            });
        });

        describe('proposalStageAmount()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalStageAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalStageAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalTargetBalanceAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalBalanceReward()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalBalanceReward(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalBalanceReward(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalDisqualificationChallenger()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationChallenger(glob.user_a);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalDisqualificationChallenger(glob.owner, mocks.address0, 0))
                    .should.equal(utils.getAddress(glob.user_a));
            });
        });

        describe('proposalDisqualificationBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalDisqualificationBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalDisqualificationCandidateHash()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationCandidateHash(mocks.hash1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalDisqualificationCandidateHash(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.hash1);
            });
        });

        describe('proposalDisqualificationCandidateType()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationCandidateType('payment');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByPayment.proposalDisqualificationCandidateType(glob.owner, mocks.address0, 0))
                    .should.equal('payment');
            });
        });

        describe('challengeByPayment()', () => {
            let payment;

            before(async () => {
                await ethersNullSettlementDisputeByPayment._reset();
                payment = await mocks.mockPayment(glob.owner);
            });

            it('should call corresponding function in challenge dispute instance', async () => {
                await ethersNullSettlementChallengeByPayment.challengeByPayment(payment.sender.wallet, payment, {gasLimit: 2e6});

                (await ethersNullSettlementDisputeByPayment._challengeByPaymentCount())
                    ._bn.should.eq.BN(1);
            });
        });
    });
};
