let scriptLoadPromise = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script."));
    document.body.appendChild(script);
  });
  return scriptLoadPromise;
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

/**
 * @param {object} session - the ProviderCheckoutSession returned by the backend
 * @param {object} opts
 * @param {string} [opts.description]
 * @param {() => void} opts.onSuccess
 * @param {() => void} [opts.onDismiss]
 * @param {(err: Error) => void} opts.onError
 */
export async function openRazorpayCheckout(session, { description, onSuccess, onDismiss, onError } = {}) {
  try {
    if (!session) throw new Error("No checkout session returned by the server.");

    if (pick(session, ["mockMode", "isMockMode"])) {
      onSuccess?.();
      return;
    }

    const hostedUrl = pick(session, ["checkoutUrl", "hostedUrl", "url"]);
    if (hostedUrl) {
      window.location.href = hostedUrl;
      return;
    }

    const keyId = pick(session, ["providerKeyId", "keyId", "razorpayKeyId", "key"]);
    const checkoutId = pick(session, [
      "providerOrderOrSubscriptionId", "orderId", "providerOrderId", "id", "providerCheckoutId",
    ]);
    

    if (checkoutId && !keyId) {
      onSuccess?.();
      return;
    }

    if (!keyId || !checkoutId) {
      throw new Error(
        "Checkout session is missing providerKeyId/providerOrderOrSubscriptionId — got: "
        + JSON.stringify(session)
      );
    }

    await loadRazorpayScript();

    const isRecurring = Boolean(pick(session, ["recurring", "isRecurring"]));
    const amount = pick(session, ["amount", "amountMinorUnits", "totalMinorUnits"]);
    const currency = pick(session, ["currency"]) || "INR";
    const prefillEmail = pick(session, ["contactEmail", "email"]);
    const prefillName = pick(session, ["orgName", "name"]);

    const rzp = new window.Razorpay({
      key: keyId,
      ...(isRecurring ? { subscription_id: checkoutId } : { order_id: checkoutId, amount }),
      currency,
      name: "CalVant",
      description: description || "CalVant subscription",
      prefill: {
        email: prefillEmail,
        name: prefillName,
      },
      theme: { color: "#3b82f6" },
      handler: function () {
        onSuccess?.();
      },
      modal: {
        ondismiss: function () {
          onDismiss?.();
        },
      },
    });

    rzp.on("payment.failed", function (response) {
      onError?.(new Error(response?.error?.description || "Payment failed."));
    });

    rzp.open();
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}