import { useNavigate } from "react-router-dom";

function Scanner() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-card" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="page-hero">
          <div>
            <h2 className="page-title">Vehicle Scanner</h2>
            <p className="page-subtitle">Quickly access trusted scanning tools and retrieve your vehicle number to view owner details instantly.</p>
          </div>
        </div>

        <div className="form-grid">
          <a className="primary-btn" href="https://lens.google.com/" target="_blank" rel="noreferrer">Open Google Lens</a>
          <a className="secondary-btn" href="https://www.google.com/search?q=qr+code+scanner" target="_blank" rel="noreferrer">Open QR Code Scanner</a>
          <button className="outline-btn" type="button" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}

export default Scanner;
