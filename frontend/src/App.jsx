import { useEffect, useState } from "react";
import "./App.css";

function App() {

  // =========================
  // STATE
  // =========================

  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [matches, setMatches] = useState([]);

  // =========================
  // DASHBOARD CALCULATIONS
  // =========================

  const totalPayments = payments.length;

  const matchedCount = payments.filter(
    payment => payment.status === "MATCHED"
  ).length;

  const unmatchedCount = payments.filter(
    payment => payment.status === "UNMATCHED"
  ).length;

  const cashApplicationRate =
    totalPayments === 0
      ? 0
      : ((matchedCount / totalPayments) * 100).toFixed(1);

  const unmatchedAmount = payments
    .filter(payment => payment.status === "UNMATCHED")
    .reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

  // =========================
  // GET PAYMENTS
  // =========================

  useEffect(() => {

    fetch("http://localhost:8080/api/payments")
      .then(response => response.json())
      .then(data => {
        setPayments(data);
      })
      .catch(error => {
        console.error("Error loading payments:", error);
      });

  }, []);

  // =========================
  // VIEW MATCHES
  // =========================

  const viewMatches = (payment) => {

    setSelectedPayment(payment);

    setMatches([]);

    fetch(
      `http://localhost:8080/api/payments/${payment.paymentId}/matches`
    )
      .then(response => response.json())
      .then(data => {
        setMatches(data);
      })
      .catch(error => {
        console.error("Error loading matches:", error);
      });

  };

  // =========================
  // AMOUNT DIFFERENCE
  // =========================

  const getAmountDifference = (match) => {

    return Math.abs(
      Number(match.paymentAmount) -
      Number(match.invoiceAmount)
    );

  };

  // =========================
  // MATCH TYPE
  // =========================

  const getMatchType = (match) => {

    const paymentAmount = Number(match.paymentAmount);
    const invoiceAmount = Number(match.invoiceAmount);

    if (paymentAmount === invoiceAmount) {
      return "FULL MATCH";
    }

    if (paymentAmount < invoiceAmount) {
      return "PARTIAL PAYMENT";
    }

    if (paymentAmount > invoiceAmount) {
      return "OVERPAYMENT";
    }

    return "REVIEW";
  };

  // =========================
  // MATCH EVIDENCE
  // =========================

  const getMatchEvidence = (match) => {

    const evidence = [];

    if (match.customer) {

      evidence.push(
        "✓ Customer information matches"
      );

    }

    const paymentAmount = Number(match.paymentAmount);
    const invoiceAmount = Number(match.invoiceAmount);

    const difference = Math.abs(
      paymentAmount - invoiceAmount
    );

    if (difference === 0) {

      evidence.push(
        "✓ Payment and invoice amounts match exactly"
      );

    } else if (paymentAmount < invoiceAmount) {

      evidence.push(
        `⚠ Payment is ₹${difference} less than invoice`
      );

    } else {

      evidence.push(
        `⚠ Payment is ₹${difference} greater than invoice`
      );

    }

    return evidence;
  };

  // =========================
  // AI EXPLANATION
  // =========================

  const generateExplanation = (match) => {

    const paymentAmount = Number(match.paymentAmount);
    const invoiceAmount = Number(match.invoiceAmount);

    const difference = Math.abs(
      paymentAmount - invoiceAmount
    );

    if (
      match.customer &&
      paymentAmount === invoiceAmount
    ) {

      return (
        "The payment and invoice belong to the same customer " +
        "and the amounts match exactly. This is a strong match " +
        "and can be considered for confirmation."
      );

    }

    if (
      match.customer &&
      paymentAmount < invoiceAmount
    ) {

      return (
        "The payment belongs to the same customer, but the " +
        `payment is ₹${difference} less than the invoice amount. ` +
        "This may represent a partial payment and should be " +
        "reviewed before confirmation."
      );

    }

    if (
      match.customer &&
      paymentAmount > invoiceAmount
    ) {

      return (
        "The payment belongs to the same customer, but the " +
        `payment is ₹${difference} greater than the invoice amount. ` +
        "This may represent an overpayment and requires manual review."
      );

    }

    return (
      "The available information is not sufficient to " +
      "confidently explain this match. Manual review is recommended."
    );

  };

  // =========================
  // RECOMMENDATION
  // =========================

  const getRecommendation = (match) => {

    const paymentAmount = Number(match.paymentAmount);
    const invoiceAmount = Number(match.invoiceAmount);

    if (paymentAmount === invoiceAmount) {

      return "Suitable for confirmation";

    }

    if (paymentAmount < invoiceAmount) {

      return "Partial payment - manual review required";

    }

    if (paymentAmount > invoiceAmount) {

      return "Overpayment - manual review required";

    }

    return "Manual review required";

  };

  // =========================
  // CONFIRM MATCH
  // =========================

  const confirmMatch = (paymentId, invoiceId) => {

    fetch(
      `http://localhost:8080/api/payments/${paymentId}/confirm/${invoiceId}`,
      {
        method: "POST"
      }
    )
      .then(response => response.text())
      .then(message => {

        alert(message);

        // Update payment status on screen
        setPayments(prevPayments =>
          prevPayments.map(payment =>
            payment.paymentId === paymentId
              ? {
                  ...payment,
                  status: "MATCHED"
                }
              : payment
          )
        );

        // Update selected payment
        setSelectedPayment(prevPayment =>
          prevPayment
            ? {
                ...prevPayment,
                status: "MATCHED"
              }
            : null
        );

      })
      .catch(error => {

        console.error(
          "Error confirming match:",
          error
        );

      });

  };

  // =========================
  // UI
  // =========================

  return (

    <div>

      {/* =========================
          HEADER
      ========================= */}

      <h1>Cash Application Workbench</h1>

      <p>O2C - Cash Application</p>

      <hr />

      {/* =========================
          DASHBOARD
      ========================= */}

      <h2>Dashboard</h2>

      <div className="dashboard">

        <div className="card">

          <h3>Total Payments</h3>

          <p>{totalPayments}</p>

        </div>

        <div className="card">

          <h3>Matched Payments</h3>

          <p>{matchedCount}</p>

        </div>

        <div className="card">

          <h3>Unmatched Payments</h3>

          <p>{unmatchedCount}</p>

        </div>

        <div className="card">

          <h3>Unapplied Cash</h3>

          <p>₹{unmatchedAmount}</p>

        </div>

      </div>

      <hr />

      {/* =========================
          BUSINESS KPIs
      ========================= */}

      <h2>Business KPIs</h2>

      <div className="kpi-container">

        <div className="kpi-card">

          <h3>Cash Application Rate</h3>

          <p>{cashApplicationRate}%</p>

        </div>

        <div className="kpi-card">

          <h3>DSO</h3>

          <p>32 Days</p>

        </div>

        <div className="kpi-card">

          <h3>Unapplied Cash</h3>

          <p>₹2,30,000</p>

        </div>

      </div>

      <hr />

      {/* =========================
          PAYMENT TABLE
      ========================= */}

      <h2>Payments</h2>

      <table>

        <thead>

          <tr>

            <th>Payment ID</th>

            <th>Customer</th>

            <th>Amount</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {payments.map(payment => (

            <tr key={payment.paymentId}>

              <td>
                {payment.paymentId}
              </td>

              <td>
                {payment.customer}
              </td>

              <td>
                ₹{payment.amount}
              </td>

              <td>
                {payment.status}
              </td>

              <td>

                {payment.status === "UNMATCHED" && (

                  <button
                    onClick={() => viewMatches(payment)}
                  >
                    View Matches
                  </button>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <hr />

      {/* =========================
          SELECTED PAYMENT
      ========================= */}

      {selectedPayment && (

        <div className="payment-details">

          <h2>Payment Details</h2>

          <p>

            <strong>Payment ID:</strong>{" "}

            {selectedPayment.paymentId}

          </p>

          <p>

            <strong>Customer:</strong>{" "}

            {selectedPayment.customer}

          </p>

          <p>

            <strong>Amount:</strong>{" "}

            ₹{selectedPayment.amount}

          </p>

          <p>

            <strong>Status:</strong>{" "}

            {selectedPayment.status}

          </p>

        </div>

      )}

      {/* =========================
          POSSIBLE MATCHES
      ========================= */}

      {matches.length > 0 && (

        <div className="matches">

          <h2>Possible Invoice Matches</h2>

          {matches.map(match => (

            <div
              className="match-box"
              key={match.invoiceId}
            >

              {/* INVOICE */}

              <p>

                <strong>Invoice ID:</strong>{" "}

                {match.invoiceId}

              </p>

              <p>

                <strong>Customer:</strong>{" "}

                {match.customer}

              </p>

              {/* AMOUNTS */}

              <p>

                <strong>Invoice Amount:</strong>{" "}

                ₹{match.invoiceAmount}

              </p>

              <p>

                <strong>Payment Amount:</strong>{" "}

                ₹{match.paymentAmount}

              </p>

              {/* CONFIDENCE */}

              <p>

                <strong>Confidence:</strong>{" "}

                {match.confidence}

              </p>

              {/* MATCH TYPE */}

              <p>

                <strong>Match Type:</strong>{" "}

                {getMatchType(match)}

              </p>

              {/* EVIDENCE */}

              <h3>Match Evidence</h3>

              <ul>

                {getMatchEvidence(match).map(
                  (item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}

              </ul>

              {/* AMOUNT DIFFERENCE */}

              <p>

                <strong>Amount Difference:</strong>{" "}

                ₹{getAmountDifference(match)}

              </p>

              {/* AI EXPLANATION */}

              <div className="ai-box">

                <h3>🤖 AI Explanation</h3>

                <p>

                  {generateExplanation(match)}

                </p>

                <p>

                  <strong>
                    Recommendation:
                  </strong>{" "}

                  {getRecommendation(match)}

                </p>

              </div>

              {/* CONFIRMATION */}

              {selectedPayment.status === "MATCHED" ? (

                <p className="success">

                  ✓ Match Confirmed

                </p>

              ) : Number(match.paymentAmount) ===
                Number(match.invoiceAmount) ? (

                <button
                  onClick={() =>
                    confirmMatch(
                      selectedPayment.paymentId,
                      match.invoiceId
                    )
                  }
                >

                  Confirm Match

                </button>

              ) : (

                <p className="review-message">

                  ⚠ Manual review required before confirmation

                </p>

              )}

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

export default App;