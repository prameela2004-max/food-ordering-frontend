import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="foodlyFooter">
      <div className="foodlyFooter__inner">
        <div className="foodlyFooter__brand">
          <Link to="/home" className="foodlyFooter__logo" aria-label="Foodly home">
            <span className="foodlyFooter__logoIcon" aria-hidden="true">🍔</span>
            <span>Foodly</span>
          </Link>
          <p>Your favorite food, delivered with love.</p>
        </div>

        <nav className="foodlyFooter__nav" aria-label="Footer navigation">
          <Link to="/home">Home</Link>
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/popular">Popular</Link>
        </nav>

        <div className="foodlyFooter__bottom">
          <span>© 2026 Foodly. All rights reserved.</span>
          <span className="foodlyFooter__madeWith">Made with <span aria-label="love">♥</span> for food lovers</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
