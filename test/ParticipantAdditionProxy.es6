var ParticipantAdditionProxy = artifacts.require("./ParticipantAdditionProxy.sol");

var BigNumber = require("bignumber.js");

const HttpProvider = require(`ethjs-provider-http`);
const EthRPC = require(`ethjs-rpc`);
const EthQuery = require(`ethjs-query`);

const ethRPC = new EthRPC(new HttpProvider(`http://localhost:8545`));
const ethQuery = new EthQuery(new HttpProvider(`http://localhost:8545`));

contract('ParticipantAdditionProxy', function(accounts) {
    const EXP_18 = 18;
    const MINUTE = 60;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const YEAR = 365 * DAY;

    now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;

    // Get block timestamp
    beforeEach(async () => {
        now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    });

    describe("allocatePresaleBalances", () => {

        context("Adding presale users", async () => {


            it("Should give 100 presale users 1 Token Each, one at a time", async () => {
                let token = await ParticipantAdditionProxy.new();
                for (var i = 0; i < 100; i++) {
                    // console.log(accounts[i]);
                    await token.allocatePresaleBalances([accounts[i]], [1]);
                }
                const total_dist = await token.presaleAllocationTokenCount.call();

                assert.equal(total_dist.valueOf(), 100, "Not everyone got 1 token");
            });


            it("Should give a presale user the entire allocation and compare to PRESALE_TOKEN_ALLOCATION_CAP", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocatePresaleBalances([accounts[2]], [65 * (10**6) * 10**EXP_18]);

                const total_dist = await token.presaleAllocationTokenCount.call();
                const PRESALE_TOKEN_ALLOCATION_CAP = await token.PRESALE_TOKEN_ALLOCATION_CAP.call();

                assert.equal(total_dist.valueOf(), PRESALE_TOKEN_ALLOCATION_CAP.valueOf(), "Single user didn't get whole pot");
            });
        });
        context("Checking requirements", async () => {


            it("Should not allow presale user to be input twice", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocatePresaleBalances([accounts[0]], [1]);
                try {
                    await token.allocatePresaleBalances([accounts[0]], [2]);
                } catch (e) {
                    return true;
                }
                assert.fail("The function executed when it should not have.")
            });

            it("Should not allow presale collection to go over PRESALE_TOKEN_ALLOCATION_CAP", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocatePresaleBalances([accounts[2]], [64 * (10**6) * 10**EXP_18]);

                try {
                    await token.allocatePresaleBalances([accounts[2]], [2 * (10**6) * 10**EXP_18]);
                } catch (e) {
                    return true;
                }
                assert.fail("The function executed when it should not have.")
            });
        });
    });

    describe("allocateSaleBalances", () => {

        context("Adding sale users", async () => {

            it("Should give 100 sale users 1 Token Each, one at a time", async () => {
                let token = await ParticipantAdditionProxy.new();
                for (var i = 0; i < 100; i++) {
                    // console.log(accounts[i]);
                    await token.allocateSaleBalances([accounts[i]], [1]);
                }
                const total_dist = await token.saleAllocationTokenCount.call();

                assert.equal(total_dist.valueOf(), 100, "Not everyone got 1 token");
            });

            it("Should give a sale user the entire allocation and compare to SALE_TOKEN_ALLOCATION_CAP", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocateSaleBalances([accounts[2]], [135 * (10**6) * 10**EXP_18]);

                const total_dist = await token.saleAllocationTokenCount.call();
                const SALE_TOKEN_ALLOCATION_CAP = await token.SALE_TOKEN_ALLOCATION_CAP.call();

                assert.equal(total_dist.valueOf(), SALE_TOKEN_ALLOCATION_CAP.valueOf(), "Single user didn't get whole pot");
            });
        });

        context("Checking requirements", async () => {

            it("Should not allow sale user to be input twice", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocateSaleBalances([accounts[0]], [1]);
                try {
                    await token.allocateSaleBalances([accounts[0]], [2]);
                } catch (e) {
                    return true;
                }
                assert.fail("The function executed when it should not have.")
            });

            it("Should not allow sale collection to go over PRESALE_TOKEN_ALLOCATION_CAP", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocateSaleBalances([accounts[2]], [134 * (10**6) * 10**EXP_18]);

                try {
                    await token.allocateSaleBalances([accounts[2]], [2 * (10**6) * 10**EXP_18]);
                } catch (e) {
                    return true;
                }
                assert.fail("The function executed when it should not have.")
            });
        });
    });

    describe("endPresaleParticipantAddition", () => {

        context("Closing the presale", async () => {

            it("Should set presaleAdditionDone to true when all tokens have been collected", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocatePresaleBalances([accounts[2]], [65 * (10**6) * 10**EXP_18]);
                await token.endPresaleParticipantAddition();

                const presaleAdditionDone = await token.presaleAdditionDone.call();

                assert.equal(presaleAdditionDone.valueOf(), true, "presaleAdditionDone is not true");
            });

            it("Should not allow the presale to close before all fund have been added", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocatePresaleBalances([accounts[2]], [1]);
                try {
                    await token.endPresaleParticipantAddition();
                } catch (e) {
                    return true;
                }
                assert.fail("The function executed when it should not have.")
            });
        });
    });

    describe("endSaleParticipantAddition", () => {

        context("Closing the sale", async () => {

            it("Should set saleAdditionDone to true when all tokens have been collected", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocateSaleBalances([accounts[2]], [135 * (10**6) * 10**EXP_18]);
                await token.endSaleParticipantAddition();

                const saleAdditionDone = await token.saleAdditionDone.call();

                assert.equal(saleAdditionDone.valueOf(), true, "saleAdditionDone is not true");
            });

            it("Should not allow the sale to close before all fund have been added", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocateSaleBalances([accounts[2]], [1]);
                try {
                    await token.endSaleParticipantAddition();
                } catch (e) {
                    return true;
                }
                assert.fail("The function executed when it should not have.")
            });
        });
    });

    ////////////////
    // modifiers //
    //////////////

    describe("modifiers", () => {
        context("presaleParticipantAdditionOngoing", async () => {
            it("Should set presaleAdditionDone to true when all tokens have been collected", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocatePresaleBalances([accounts[2]], [65 * (10**6) * 10**EXP_18]);
                await token.endPresaleParticipantAddition();

                try {
                    await token.allocatePresaleBalances([accounts[1]], [1]);
                } catch (e) {
                    return true;
                }
                assert.fail("The function executed when it should not have.")
            });
        });

        context("saleParticipantAdditionOngoing", async () => {
            it("Should set saleAdditionDone to true when all tokens have been collected", async () => {
                let token = await ParticipantAdditionProxy.new();
                await token.allocateSaleBalances([accounts[2]], [135 * (10**6) * 10**EXP_18]);
                await token.endSaleParticipantAddition();

                try {
                    await token.allocateSaleBalances([accounts[1]], [1]);
                } catch (e) {
                    return true;
                }
                assert.fail("The function executed when it should not have.")
            });
        });
    });
});
