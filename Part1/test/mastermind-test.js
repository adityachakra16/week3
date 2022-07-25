//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

const wasm_tester = require("circom_tester").wasm;
const buildPoseidon = require("circomlibjs").buildPoseidon;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
const Fr = new F1Field(exports.p);

function calculateHB(guess, solution) {
  const hit = solution.filter((sol, i) => {
    return sol === guess[i];
  }).length;

  const blow = solution.filter((sol, i) => {
    return sol !== guess[i] && guess.some((g) => g === sol);
  }).length;

  return [hit, blow];
}

describe("Mastermind Variation", function () {
  let poseidon;
  let circuit;

  before(async () => {
    poseidon = await buildPoseidon();
    circuit = await wasm_tester(
      "contracts/circuits/MastermindVariation.circom"
    );
  });

  it("should fail if a digit more than 6 is used in guess or solutions", async () => {
    const guess1 = [17, 2, 3, 4];
    const solution1 = [1, 2, 3, 4];
    const [hit1, blow1] = calculateHB(guess1, solution1);
    const salt1 = ethers.BigNumber.from(ethers.utils.randomBytes(32));
    const solutionHash1 = poseidon.F.toObject(poseidon([salt1, ...solution1]));
    const INPUT = {
      pubGuessA: guess1[0],
      pubGuessB: guess1[1],
      pubGuessC: guess1[2],
      pubGuessD: guess1[3],
      pubNumHit: hit1.toString(),
      pubNumBlow: blow1.toString(),
      pubSolnHash: solutionHash1.toString(),
      privSolnA: solution1[0],
      privSolnB: solution1[1],
      privSolnC: solution1[2],
      privSolnD: solution1[3],
      privSalt: salt1.toString(),
    };

    expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);

    const guess2 = [1, 2, 3, 4];
    const solution2 = [12, 2, 3, 4];
    const [hit2, blow2] = calculateHB(guess1, solution1);
    const salt2 = ethers.BigNumber.from(ethers.utils.randomBytes(32));
    const solutionHash2 = poseidon.F.toObject(poseidon([salt1, ...solution1]));
    const INPUT2 = {
      pubGuessA: guess2[0],
      pubGuessB: guess2[1],
      pubGuessC: guess2[2],
      pubGuessD: guess2[3],
      pubNumHit: hit2.toString(),
      pubNumBlow: blow2.toString(),
      pubSolnHash: solutionHash2.toString(),
      privSolnA: solution2[0],
      privSolnB: solution2[1],
      privSolnC: solution2[2],
      privSolnD: solution2[3],
      privSalt: salt2.toString(),
    };

    expect(circuit.calculateWitness(INPUT2, true)).to.be.revertedWith(Error);
  });

  it("should fail if there are duplicate digits", async () => {
    const guess1 = [2, 2, 3, 4];
    const solution1 = [1, 2, 3, 4];
    const [hit1, blow1] = calculateHB(guess1, solution1);
    const salt1 = ethers.BigNumber.from(ethers.utils.randomBytes(32));
    const solutionHash1 = poseidon.F.toObject(poseidon([salt1, ...solution1]));
    const INPUT = {
      pubGuessA: guess1[0],
      pubGuessB: guess1[1],
      pubGuessC: guess1[2],
      pubGuessD: guess1[3],
      pubNumHit: hit1.toString(),
      pubNumBlow: blow1.toString(),
      pubSolnHash: solutionHash1.toString(),
      privSolnA: solution1[0],
      privSolnB: solution1[1],
      privSolnC: solution1[2],
      privSolnD: solution1[3],
      privSalt: salt1.toString(),
    };

    expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
  });

  it("Circuit should return correct number of hit and blows", async function () {
    //[assignment] insert your script here

    const guess1 = [1, 2, 3, 4];
    const solution1 = [1, 2, 4, 3];
    const [hit1, blow1] = calculateHB(guess1, solution1);
    const salt1 = ethers.BigNumber.from(ethers.utils.randomBytes(32));
    const solutionHash1 = poseidon.F.toObject(poseidon([salt1, ...solution1]));
    const INPUT = {
      pubGuessA: guess1[0],
      pubGuessB: guess1[1],
      pubGuessC: guess1[2],
      pubGuessD: guess1[3],
      pubNumHit: hit1.toString(),
      pubNumBlow: blow1.toString(),
      pubSolnHash: solutionHash1.toString(),
      privSolnA: solution1[0],
      privSolnB: solution1[1],
      privSolnC: solution1[2],
      privSolnD: solution1[3],
      privSalt: salt1.toString(),
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    assert(Fr.e(witness[1]), Fr.e(solutionHash1.toString()));
  });
});
