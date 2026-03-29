import { useNavigate } from "react-router-dom";

function Scanner() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px" }}>
      <h2>Vehicle Scanner</h2>
      <p>
        Use one of these tools to scan your vehicle QR code or barcode.
        After scanning, copy the vehicle number and open the scan page.
      </p>
      <div style={{ display: "flex", gap: "12px", flexDirection: "column", maxWidth: 420 }}>
        <a
          href="https://lens.google.com/"
          target="_blank"
          rel="noreferrer"
          style={{ padding: "12px 16px", background: "#1a73e8", color: "white", textDecoration: "none", borderRadius: 6, textAlign: "center" }}
        >
          Open Google Lens
        </a>
        <a
          href="https://www.google.com/search?q=qr+code+scanner"
          target="_blank"
          rel="noreferrer"
          style={{ padding: "12px 16px", background: "#34a853", color: "white", textDecoration: "none", borderRadius: 6, textAlign: "center" }}
        >
          Open QR Code Scanner
        </a>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: "12px 16px", borderRadius: 6, border: "1px solid #ccc", background: "white" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default Scanner;
