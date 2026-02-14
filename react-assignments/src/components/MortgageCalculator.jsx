import React, { useState } from "react";
import "../styles/MortgageCalculator.css";

function MortgageCalculator() {
  const [inputVal, setInputVal] = useState({
    loanAmount: "",
    interestRate: "",
    loanTerm: "",
  });

  const [mortgageDetails, setMortgageDetails] = useState({
    monthlyPayment: 0,
    totalPaymentAmt: 0,
    totalInterestPaid: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputVal((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoanDetails = () => {
    const P = parseFloat(inputVal.loanAmount);
    const i = parseFloat(inputVal.interestRate) / 100 / 12;
    const n = parseInt(inputVal.loanTerm) * 12;

    let monthlyPayment;
    if (i === 0) {
      monthlyPayment = P / n;
    } else {
      const x = Math.pow(1 + i, n);
      monthlyPayment = (P * i * x) / (x - 1);
    }

    const totalPaymentAmt = monthlyPayment * n;
    const totalInterestPaid = totalPaymentAmt - P;

    setMortgageDetails({
      monthlyPayment,
      totalPaymentAmt,
      totalInterestPaid,
    });
  };

  return (
    <div className="container">
      <h1 className="title">Mortgage Calculator</h1>
      <label>Loan amount</label>
      <input
        type="number"
        name="loanAmount"
        value={inputVal.loanAmount}
        placeholder="Ex. 50000"
        onChange={handleChange}
      />

      <label>Annual interest rate (%)</label>
      <input
        type="number"
        name="interestRate"
        value={inputVal.interestRate}
        placeholder="Ex. 5"
        onChange={handleChange}
      />

      <label>Loan term (years)</label>
      <input
        type="number"
        name="loanTerm"
        value={inputVal.loanTerm}
        placeholder="Ex. 30"
        onChange={handleChange}
      />

      <button onClick={handleLoanDetails}>Calculate</button>

      <div className="results">
        <p>Monthly Payment: {mortgageDetails.monthlyPayment.toFixed(2)}</p>
        <p>Total Payment: {mortgageDetails.totalPaymentAmt.toFixed(2)}</p>
        <p>
          Total Interest Paid: {mortgageDetails.totalInterestPaid.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default MortgageCalculator;
