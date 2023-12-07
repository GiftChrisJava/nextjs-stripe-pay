"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import styles from "./page.css"; // Import the CSS module

const stripePromise = loadStripe(
  "pk_test_51NV9VgFgObjlCeyVYiNz6TRqEcgGQoA0KQmKiaZowXxUF9D4ii46GyNR9fPwruKP4y7YZ8imveEukPs7jwxVhEUv00dtdCXoDA"
);

function Payment() {
  const [cardHolderName, setCardHolderName] = useState("Traveler");
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    const { token, error } = await stripe.createToken({
      card: {
        number: cardNumberElement,
        exp_month: cardExpiryElement._private.state.expMonth,
        exp_year: cardExpiryElement._private.state.expYear,
        cvc: cardCvcElement,
      },
      name: cardHolderName,
    });

    if (error) {
      console.error("Error:", error);
    } else {
      const paymentData = {
        travelerId: 1,
      };

      const response = await fetch("http://localhost:8080/traveler/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentData,
          token: token.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Error:", data.error);
      } else {
        console.log("Payment Successful:", data.payment);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1>Stripe Payment Test</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>Card Number:</label>
        <CardNumberElement className="card" />

        <label>Expiration Date:</label>
        <CardExpiryElement className="card" />

        <label>CVV:</label>
        <CardCvcElement className="card" />

        <button type="submit">Submit Payment</button>
      </form>
    </div>
  );
}

// Wrap the Payment component with the Elements provider
export default function WrappedPayment() {
  return (
    <Elements stripe={stripePromise}>
      <Payment />
    </Elements>
  );
}
